---
layout: article
title: spring支持任意多数据库的方案
date: 2020-05-26 20:44:41 +0800
categories: spring
tags: spring,datasource
---

在某些场景下，spring可能需要同时支持多个数据源，但一般网上都是支持2个数据源，万一需要支持多个怎么办呢？其实也很简单。

yaml配置

{% highlight yaml linenos %}

my:
  multidb:
    datasource:
      test:
        url: "jdbc:oracle:thin:@//10.20.30.40:11521/XE"
        username: "test"
        password: "test"
        driver-class-name: "oracle.jdbc.OracleDriver"
        testWhileIdle: true
        test-on-borrow: true
        max-active: 10
        initial-size: 3
        min-idle: 2
      test1:
        url: "jdbc:oracle:thin:@//10.20.30.41:21521/XE"
        username: "test"
        password: "test"
        driver-class-name: "oracle.jdbc.OracleDriver"
        testWhileIdle: true
        test-on-borrow: true
        max-active: 10
        initial-size: 3
        min-idle: 2
      test2:
        url: "jdbc:oracle:thin:@//10.20.30.42:31521/XE"
        username: "test"
        password: "test"
        driver-class-name: "oracle.jdbc.OracleDriver"
        testWhileIdle: true
        test-on-borrow: true
        max-active: 10
        initial-size: 3
        min-idle: 2

{% endhighlight %}



java代码


{% highlight java linenos %}

import com.alibaba.druid.pool.DruidDataSource;
import lombok.Data;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DatabaseConfiguration {

    @ConditionalOnMissingBean
    @ConfigurationProperties(
            prefix = "my.multidb",
            ignoreInvalidFields = true
    )
    @Bean
    DatabaseConfig createDatabaseProps() {
        return new DatabaseConfig();
    }

    @Bean
    public DatabaseTemplate databaseTemplate(DatabaseConfig databaseConfig)
            throws Exception {
        DatabaseTemplate databaseTemplate = new DatabaseTemplate();
        Map<String, JdbcTemplate> templates = new HashMap<>();
        for (Map.Entry<String, DruidDataSource> en : databaseConfig.getDatasource().entrySet()) {
            String name = en.getKey();
            DruidDataSource source = en.getValue();
            JdbcTemplate template = new JdbcTemplate(source, true);
            templates.put(name, template);
        }
        databaseTemplate.setTemplate(Collections.unmodifiableMap(templates));
        return databaseTemplate;
    }

    @Data
    public static class DatabaseTemplate {
        Map<String, JdbcTemplate> template;
    }

    @Data
    public static class DatabaseConfig {
        Map<String, DruidDataSource> datasource;
    }

}

{% endhighlight %}


JUnit跑一下吧：

{% highlight java linenos %}

@Autowired
DatabaseConfiguration.DatabaseTemplate database;


@Test
public void multidb() throws Exception {
    System.out.println(database.getTemplate());
}
{% endhighlight %}

还算可以吧？
