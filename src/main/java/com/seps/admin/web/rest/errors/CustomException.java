package com.seps.admin.web.rest.errors;

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
    private final boolean useMessageDirectly;

    public <T extends StatusType> CustomException(Status status, T sepsStatusCode, String[] messageArgs, Map<String, Object> parameters) {
        super(ErrorConstants.PARAMETERIZED_TYPE, status.getReasonPhrase(), status, null, null, null, parameters);

        this.message = sepsStatusCode.getReasonPhrase();
        this.sepsStatusCode = sepsStatusCode;
        this.messageArgs = messageArgs;
        this.useMessageDirectly = false;
    }

    public <T extends StatusType> CustomException(Status status, T sepsStatusCode, String message) {
        super(ErrorConstants.PARAMETERIZED_TYPE, status.getReasonPhrase(), status, null, null, null, null);
        this.message = message;
        this.sepsStatusCode = sepsStatusCode;
        this.messageArgs = null;
        this.useMessageDirectly = true;
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

    public boolean isUseMessageDirectly() {
        return useMessageDirectly;
    }

}
