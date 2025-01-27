import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

function Captcha({ onChangeCaptchaCode, reCaptchaRef }) {
    // const reCaptchaRef = useRef(null);
    const captchaKey = process.env.REACT_APP_CPATCHA_KEY;

    // when captcha is expired
    const onExpired = () => {
        reCaptchaRef.current.reset();
        onChangeCaptchaCode('');
    }



    return (
        <div>
            <ReCAPTCHA
                ref={reCaptchaRef}
                sitekey={captchaKey}
                onChange={onChangeCaptchaCode}
                className='reCaptcha overflow-x-auto overflow-y-hidden'
                onExpired={onExpired}
            />
        </div>
    );
}

export default Captcha;