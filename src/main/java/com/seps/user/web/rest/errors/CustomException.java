package com.seps.user.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;
import org.zalando.problem.StatusType;

import java.io.Serial;
import java.util.Map;


public class CustomException extends AbstractThrowableProblem {

    @Serial
    private static final long serialVersionUID = 1L;

    private final String message;
    private final StatusType sepsStatusCode;
    private final String[] messageArgs;

    public <T extends StatusType> CustomException(Status status, T sepsStatusCode, String[] messageArgs, Map<String, Object> parameters) {
        super(ErrorConstants.PARAMETERIZED_TYPE, status.getReasonPhrase(), status, null, null, null, parameters);

        this.message = sepsStatusCode.getReasonPhrase();
        this.sepsStatusCode = sepsStatusCode;
        this.messageArgs = messageArgs;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public StatusType getsSepsStatusCode() {
        return sepsStatusCode;
    }

    public String[] getMessageArgs() {
        return messageArgs;
    }
}
