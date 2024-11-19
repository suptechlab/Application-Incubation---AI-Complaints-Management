import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next' // Importing the useTranslation hook

const SetupAccountSection = ({ handleSignUpClick }) => {
    const { t } = useTranslation(); // Using the useTranslation hook to access t() function

    return (
        <React.Fragment>
            <h6 className="fw-bold">{t('NEW_USER_PROMPT')}</h6>
            <p>{t('ACCOUNT_SETUP_INSTRUCTION')}</p>
            <Button
                type="button"
                variant="warning"
                onClick={handleSignUpClick}
            >
                {t('SET_UP_ACCOUNT_BUTTON')}
            </Button>
        </React.Fragment>
    )
}

export default SetupAccountSection
