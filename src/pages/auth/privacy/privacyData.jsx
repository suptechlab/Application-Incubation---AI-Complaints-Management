import React from 'react'
import { useTranslation } from 'react-i18next'

const PrivacyData = () => {
    const { t } = useTranslation()
    return (
        <React.Fragment>
            <p>
                {t('PRIVACY_TEXT_P1')}
            </p>
            <p>
              {t('PRIVACY_TEXT_P2')}
            </p>

        </React.Fragment>
    )
}

export default PrivacyData