package com.seps.auth.service;

import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.util.EntityUtils;

@Service
public class RecaptchaService {

    @Value("${google.recaptcha.secret:test}")

    private String recaptchaSecret;

    @Value("${google.recaptcha.verify-url:test}")

    private String recaptchaVerifyUrl;

    public boolean verifyRecaptcha(String recaptchaResponse) throws IOException {
        // Create HttpClient
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(recaptchaVerifyUrl);
            httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded");
            String body = "secret=" + recaptchaSecret + "&response=" + recaptchaResponse;
            httpPost.setEntity(new StringEntity(body, StandardCharsets.UTF_8));
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                JSONObject jsonObject = new JSONObject(responseBody);
                return Boolean.TRUE.equals(jsonObject.getBoolean("success"));
            }

        }

    }

}
