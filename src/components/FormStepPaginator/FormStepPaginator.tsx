import React, { useState } from 'react';
import './FormStepPaginator.css';
import { JSONSchema6 } from 'json-schema';
import { Button, ButtonGroup } from '@material-ui/core';

type FormStepPaginatorProps = {
    jsonSchemes: JSONSchema6[];
    onAddNewStep: () => void;
    onStepChange: (i: number) => void;
}

function FormStepPaginator(props: FormStepPaginatorProps): JSX.Element {
    const [currentStep, setCurrentStep] = useState<number>(0);

    const onStepChange = (i: number) => {
        setCurrentStep(i);
        props.onStepChange(i);
    };

    const onAddNewStep = () => {
        // automatically make the new step active
        onStepChange(currentStep + 1);
        props.onAddNewStep();
    };

    const renderSteps = () => {
        let steps: JSX.Element[] = [];

        for (let i: number = 0; i < props.jsonSchemes.length; ++i) {
            steps.push(
                <Button key={i} className={"btn btn-secondary " + (currentStep === i ? "active-step" : "")} onClick={() => onStepChange(i)}>{i + 1}</Button>
            );
        }

        steps.push(
            <Button key={steps.length} onClick={() => onAddNewStep()}>+</Button>
        );

        return steps;
    };

    return (
        <>

            <ButtonGroup size="small" aria-label="small outlined button group">
                <Button>Form steps: </Button>
                {renderSteps()}
            </ButtonGroup>
        </>
    );
};

export default FormStepPaginator;