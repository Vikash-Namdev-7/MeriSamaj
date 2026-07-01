import React from 'react';
import { motion } from 'framer-motion';

/**
 * StepWizard — Shows step progress for the multi-step create form.
 * Steps: Info -> Photo -> Details -> Review
 */
const STEPS = [
  { id: 1, label: 'Info' },
  { id: 2, label: 'Photo' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Review' },
];

const StepWizard = ({ currentStep = 1 }) => {
  return (
    <div className="flex items-center justify-between px-1">
      {STEPS.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted
                    ? '#7C5C2E'
                    : isActive
                    ? '#D4AF37'
                    : '#E5E7EB',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ color: isCompleted || isActive ? 'white' : '#9CA3AF' }}
              >
                {isCompleted ? '✓' : step.id}
              </motion.div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? '#7C5C2E' : isCompleted ? '#7C5C2E' : '#9CA3AF' }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-gray-200 mb-4">
                <motion.div
                  initial={false}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#7C5C2E' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepWizard;
