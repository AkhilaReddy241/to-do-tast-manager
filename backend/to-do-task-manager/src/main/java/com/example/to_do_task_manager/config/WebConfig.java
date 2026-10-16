package com.example.to_do_task_manager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:5173",
                                "http://127.0.0.1:5173",
                                "https://to-do-tast-manager-qgtu.vercel.app"
                        )
                        .allowedMethods(
                                "GET", "POST", "PUT",
                                "PATCH", "DELETE", "OPTIONS"
                        )
                        .allowedHeaders("*");
            }
        };
    }
}
