const Fund = require('../../models/Fund');
const Contribution = require('../../models/Contribution');
const FundExpense = require('../../models/FundExpense');
const User = require('../../models/User');

// Helper: Format Date as DD MMM YYYY (e.g. "12 Jun 2024")
const formatDisplayDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// 1. Unified Funds Loader (Community scoped)
// Fetches funds, contributions, expenses, and community users
exports.getFundsData = async (req, res) => {
  try {
    const communityId = req.communityId;
    if (!communityId) {
      return res.status(400).json({ status: 'error', message: 'Community context missing.' });
    }

    // 1. Fetch all funds (Global or Community-scoped)
    const fundsList = await Fund.find({
      $or: [
        { scope: 'GLOBAL' },
        { scope: 'COMMUNITY', communityId }
      ]
    }).sort({ createdAt: -1 });

    // 2. Self-healing check: Ensure the current user has a contribution ledger for each fund
    const myId = req.user._id;
    for (const f of fundsList) {
      const exists = await Contribution.findOne({ fundId: f._id, memberId: myId });
      if (!exists) {
        await Contribution.create({
          fundId: f._id,
          memberId: myId,
          communityId,
          assignedAmount: f.contributionPerMember,
          paidAmount: 0,
          transactions: []
        });
      }
    }

    // 3. Fetch all community members
    const membersList = await User.find({ communityId, accountStatus: { $ne: 'deleted' } })
      .select('name phone avatar');

    const memberIds = membersList.map(m => m._id);

    // 4. Fetch all contributions and expenses for these funds
    const fundIds = fundsList.map(f => f._id);
    const contributionsList = await Contribution.find({ fundId: { $in: fundIds } });
    const expensesList = await FundExpense.find({ fundId: { $in: fundIds } }).sort({ date: -1 });

    // 5. Format output
    const formattedFunds = fundsList.map(f => ({
      id: f._id.toString(),
      name: f.name,
      purpose: f.purpose || '',
      description: f.description || '',
      targetAmount: f.targetAmount,
      contributionPerMember: f.contributionPerMember,
      dueDate: f.dueDate ? f.dueDate.toISOString().split('T')[0] : '',
      startDate: f.startDate ? f.startDate.toISOString().split('T')[0] : '',
      endDate: f.endDate ? f.endDate.toISOString().split('T')[0] : '',
      status: f.status,
      assignedMembers: membersList.map(m => m._id.toString())
    }));

    const formattedContributions = {};
    fundIds.forEach(fId => {
      const key = fId.toString();
      const fundContribs = contributionsList.filter(c => c.fundId.toString() === key);
      
      // Ensure there is an entry for every community member (self-healing/completeness)
      formattedContributions[key] = membersList.map(m => {
        const mId = m._id.toString();
        const found = fundContribs.find(c => c.memberId.toString() === mId);
        
        return {
          memberId: mId,
          assignedAmount: found ? found.assignedAmount : 0,
          paidAmount: found ? found.paidAmount : 0,
          lastPaymentDate: found && found.lastPaymentDate ? formatDisplayDate(found.lastPaymentDate) : null
        };
      });
    });

    const formattedExpenses = {};
    fundIds.forEach(fId => {
      const key = fId.toString();
      const fundExps = expensesList.filter(e => e.fundId.toString() === key);
      
      formattedExpenses[key] = fundExps.map(e => ({
        id: e._id.toString(),
        title: e.title,
        category: e.category || 'General',
        amount: e.amount,
        date: e.date ? e.date.toISOString().split('T')[0] : '',
        addedBy: e.addedBy || 'Admin',
        receiptAttached: e.receiptAttached || false
      }));
    });

    const formattedUsers = membersList.map(m => ({
      id: m._id.toString(),
      name: m.name || 'Member',
      phone: m.phone || '',
      profilePic: m.name ? m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M'
    }));

    res.status(200).json({
      success: true,
      data: {
        funds: formattedFunds,
        contributions: formattedContributions,
        expenses: formattedExpenses,
        mockUsers: formattedUsers
      }
    });

  } catch (error) {
    console.error('getFundsData error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Submit a payment/contribution
exports.makePayment = async (req, res) => {
  try {
    const { fundId } = req.params;
    const { amount, paymentMethod } = req.body;
    const myId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const fund = await Fund.findById(fundId);
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    // Find or create ledger
    let contribution = await Contribution.findOne({ fundId, memberId: myId });
    if (!contribution) {
      contribution = new Contribution({
        fundId,
        memberId: myId,
        communityId: req.communityId,
        assignedAmount: fund.contributionPerMember,
        paidAmount: 0,
        transactions: []
      });
    }

    // Deduplication check: verify we don't process a duplicate txnId if passed
    const txnId = req.body.txnId || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const duplicate = contribution.transactions.some(t => t.txnId === txnId);
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Transaction already processed.' });
    }

    // Add transaction record
    contribution.transactions.push({
      txnId,
      amount: Number(amount),
      paymentMode: paymentMethod || 'Online (UPI)',
      status: 'Approved',
      date: new Date()
    });

    // Update paidAmount sum
    contribution.paidAmount = contribution.transactions
      .filter(t => t.status === 'Approved')
      .reduce((sum, t) => sum + t.amount, 0);

    contribution.lastPaymentDate = new Date();

    await contribution.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        memberId: myId.toString(),
        assignedAmount: contribution.assignedAmount,
        paidAmount: contribution.paidAmount,
        lastPaymentDate: formatDisplayDate(contribution.lastPaymentDate)
      }
    });

  } catch (error) {
    console.error('makePayment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Create Fund (Head/Admin role)
exports.createFund = async (req, res) => {
  try {
    // Only head/admin can create funds
    if (!['head', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { name, purpose, description, targetAmount, contributionPerMember, startDate, endDate, dueDate, scope } = req.body;
    const communityId = req.communityId || req.user.communityId;

    if (!name || !targetAmount || !contributionPerMember) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    // Secure Scoping: Head can ONLY create COMMUNITY-scoped funds for their own chapter.
    // Admin can create either GLOBAL or COMMUNITY-scoped funds.
    const resolvedScope = req.user.role === 'admin' ? (scope || 'GLOBAL') : 'COMMUNITY';
    const resolvedCommunityId = resolvedScope === 'GLOBAL' ? null : communityId;

    const fund = new Fund({
      name,
      purpose,
      description,
      targetAmount: Number(targetAmount),
      contributionPerMember: Number(contributionPerMember),
      startDate: startDate || new Date(),
      endDate: endDate || null,
      dueDate: dueDate || null,
      scope: resolvedScope,
      communityId: resolvedCommunityId,
      createdBy: req.user._id
    });

    await fund.save();

    // Seed contributions ledger for all matching members
    let memberQuery = { role: 'user', accountStatus: { $ne: 'deleted' } };
    if (resolvedScope === 'COMMUNITY') {
      memberQuery.communityId = resolvedCommunityId;
    }
    const members = await User.find(memberQuery);
    const contributions = members.map(m => ({
      fundId: fund._id,
      memberId: m._id,
      communityId,
      assignedAmount: fund.contributionPerMember,
      paidAmount: 0,
      transactions: []
    }));

    if (contributions.length > 0) {
      await Contribution.insertMany(contributions);
    }

    res.status(201).json({ success: true, data: fund });

  } catch (error) {
    console.error('createFund error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Add Fund Expense (Head/Admin role)
exports.addExpense = async (req, res) => {
  try {
    if (!['head', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { fundId } = req.params;
    const { title, description, amount, category, date, receiptAttached } = req.body;
    const communityId = req.communityId || req.user.communityId;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const expense = new FundExpense({
      fundId,
      communityId,
      title,
      description,
      amount: Number(amount),
      category: category || 'General',
      date: date || new Date(),
      addedBy: req.user.name || 'Admin',
      receiptAttached: receiptAttached || false
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });

  } catch (error) {
    console.error('addExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Get My Fund History (Logged-in member history of transactions across all funds)
exports.getHistory = async (req, res) => {
  try {
    const myId = req.user._id;
    const contributions = await Contribution.find({ memberId: myId })
      .populate('fundId', 'name');

    const history = [];
    contributions.forEach(c => {
      c.transactions.forEach(t => {
        if (t.status === 'Approved') {
          history.push({
            id: t._id,
            fundName: c.fundId ? c.fundId.name : 'Unknown Fund',
            fundId: c.fundId ? c.fundId._id : null,
            amount: t.amount,
            paymentMode: t.paymentMode,
            date: formatDisplayDate(t.date),
            txnId: t.txnId
          });
        }
      });
    });

    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('getHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
