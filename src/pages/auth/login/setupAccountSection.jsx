import React from 'react'
import { Button } from 'react-bootstrap'

const SetupAccountSection = ({handleSignUpClick}) => {
    return (
        <React.Fragment>
            <h6 className="fw-bold">For New User ?</h6>
            <p>To file a claim, please set up an account by clicking the button below.</p>
            <Button
                type="button"
                variant="warning"
                onClick={handleSignUpClick}
            >
                Set Up Account
            </Button>
        </React.Fragment>
    )
}

export default SetupAccountSection