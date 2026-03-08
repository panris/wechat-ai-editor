package com.wechat.aieditor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * WeChat AI-Editor Backend Application
 *
 * @author WeChat AI-Editor Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class AIEditorApplication {

    public static void main(String[] args) {
        SpringApplication.run(AIEditorApplication.class, args);
        System.out.println("""

            ================================================
            🤖 WeChat AI-Editor Backend Started
            ================================================
            API Docs: http://localhost:8080/swagger-ui.html
            Health Check: http://localhost:8080/actuator/health
            ================================================
            """);
    }
}
