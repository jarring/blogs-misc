---
layout: article
title: gradle创建war并启动tomcat
date:  2018-08-22 12:00:00 +0800
categories: 研发developer
tags: gradle war tomcat
---
工欲善其事，必先利其器。用好手中的工具，不仅能提高效率，也能实现意料之外的效果。本文介绍使用gradle创建war并启动tomcat调试。

IntelliJ IDEA终极版非常好用，但需要注册。IntelliJ IDEA社区版不需要注册，但又缺少部分功能，例如启动tomcat来调试项目。有办法用社区版来打包项目并在tomcat中启动调试吗？

有，并且也不是很麻烦。具体来说，就是把tomcat的启动参数记录下来，然后让gradle使用相同的参数来启动tomcat即可。


{% highlight groovy linenos %}
ext.tomcat = "/path/to/tomcat/"

task runTomcat(dependsOn: war) {
    doLast {
        delete "$tomcat/webapps/web", "$tomcat/webapps/web.war"
        [
                "$tomcat/temp",
                "$tomcat/logs",
                "$tomcat/work"
        ].each {
            file(it).listFiles()*.delete();
            file(it).listFiles()*.deleteDir();
        }
        copy {
            from war.archivePath
            into "$tomcat/webapps"
            rename war.archiveName, "web.war"
        }
        javaexec {
            main "org.apache.catalina.startup.Bootstrap"
            args "start"
            classpath "$tomcat/bin/bootstrap.jar", "$tomcat/bin/tomcat-juli.jar"
            jvmArgs "-Dagentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005",
                    "-Dcatalina.base=$tomcat",
                    "-Dcatalina.home=$tomcat",
                    "-Djava.io.tmpdir=$tomcat/temp",
                    "-Djava.util.logging.config.file=$tomcat/conf/logging.properties",
                    "-Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager",
                    "-Djdk.tls.ephemeralDHKeySize=2048",
                    "-Djava.protocol.handler.pkgs=org.apache.catalina.webresources",
                    "-Dorg.apache.catalina.security.SecurityListener.UMASK=0027",
                    "-Dignore.endorsed.dirs=",
                    "-Duser.language=zh",
                    "-Duser.country=CN"
        }
    }
}
{% endhighlight %}

或者，在IDE里面直接运行tomcat，这种方法既可调试，也可随意终止tomcat。
{% highlight groovy linenos %}
Main class: org.apache.catalina.startup.Bootstrap
VM options: -Dcatalina.base=/Users/developer/User/software/apache-tomcat-9.0.8 -Dcatalina.home=/Users/developer/User/software/apache-tomcat-9.0.8 -Djava.io.tmpdir=/Users/developer/User/software/apache-tomcat-9.0.8/temp -Djava.util.logging.config.file=/Users/developer/User/software/apache-tomcat-9.0.8/conf/logging.properties -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0027 -Dignore.endorsed.dirs= -Duser.language=zh -Duser.country=CN -classpath /Users/developer/User/software/apache-tomcat-9.0.8/bin/bootstrap.jar:/Users/developer/User/software/apache-tomcat-9.0.8/bin/tomcat-juli.jar 
Program arguments: start
{% endhighlight %}
