package com.seps.ticket.config;

import com.google.gson.*;
import java.lang.reflect.Type;

public class LongDeserializer implements JsonDeserializer<Long> {
    @Override
    public Long deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        if (json.isJsonPrimitive()) {
            JsonPrimitive jsonPrimitive = json.getAsJsonPrimitive();
            if (jsonPrimitive.isNumber()) {
                // If it's a floating point, convert to Long
                try {
                    // Convert to Long directly (it will drop the decimal part)
                    return jsonPrimitive.getAsNumber().longValue();
                } catch (NumberFormatException e) {
                    // Handle invalid number format
                    throw new JsonParseException("Unable to parse number as Long: " + jsonPrimitive.getAsString());
                }
            }
        }
        return null; // Return null if it's not a valid number
    }
}
