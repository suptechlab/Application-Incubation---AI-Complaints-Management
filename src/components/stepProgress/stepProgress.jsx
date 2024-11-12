import React from 'react';
import { Button } from 'react-bootstrap';
import './steps-progress.scss';
import { MdCheck } from 'react-icons/md';

// Helper to define class names based on step status
const getStepClasses = (stepCurrent, stepCompleted) => 
    `${stepCurrent ? 'step-current' : ''} ${stepCompleted ? 'step-completed' : ''}`;

// Component to display step circle and title
const StepItem = ({ stepCompleted, stepCurrent, id, stepTitle }) => (
    <>
        <span 
            className={`theme-steps-progress-circle rounded-circle d-inline-flex align-items-center justify-content-center position-relative custom-width-32 custom-height-32 fs-5 text-white lh-sm ${getStepClasses(stepCurrent, stepCompleted)}`}>
            {stepCompleted ? <MdCheck size={22} /> : id}
        </span>
        <span 
            className={`theme-steps-progress-title custom-min-width-60 custom-font-size-10 fw-semibold lh-sm d-block mt-1 ${stepCurrent ? 'opacity-100' : 'opacity-50'} ${stepCompleted ? 'text-primary opacity-100' : ''}`}>
            {stepTitle}
        </span>
    </>
);

const StepsProgress = ({ stepData = [] }) => (
    <ul className="w-100 d-flex list-unstyled mb-0 theme-steps-progress">
        {stepData.map(({ id, stepCurrent, stepCompleted, stepTitle, stepClickHandler, disabled }) => (
            <li 
                key={id} 
                className={`col text-center position-relative z-0 ${getStepClasses(stepCurrent, stepCompleted)}`}>
                
                {disabled ? (
                    <StepItem stepCompleted={stepCompleted} stepCurrent={stepCurrent} id={id} stepTitle={stepTitle} />
                ) : (
                    <Button 
                        className="p-0 border-0 text-body text-decoration-none" 
                        variant="link" 
                        onClick={stepClickHandler}
                    >
                        <StepItem stepCompleted={stepCompleted} stepCurrent={stepCurrent} id={id} stepTitle={stepTitle} />
                    </Button>
                )}
            </li>
        ))}
    </ul>
);

export default StepsProgress;