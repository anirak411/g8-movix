package csit321.cit.movix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SupabaseConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}