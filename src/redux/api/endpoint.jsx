const version = process.env.REACT_APP_API_VERSION

const EndPoint = {
  LOGIN_API: `/auth/login`,
  DPA_ACCEPT : `/${version}/dpa/accept`,
  SEND_QUERY : `/${version}/chatbot/query`,
  NATIONAL_ID_VERIFICATION: `/person-info`,
  INDIVIDUAL_PERSON_VALIDATE : `/validate-individual-person`,
  SEND_OTP : `/register/request-otp`,
  VERIFY_OTP:`/register/verify-otp`,
  REGISTER_API:'/register',
  ACCOUNT_API : '/account',
  SEND_LOGIN_OTP : '/send-login-otp',
  VERIFY_LOGIN_OTP : '/verify-login-otp',
  RESEND_LOGIN_OTP : '/resend-login-otp'
};

export default EndPoint;
