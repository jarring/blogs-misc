---
layout: article
title: 使用gradle创建可运行的jar包
date:  2018-08-22 10:00:00 +0800
categories: 研发developer
tags: gradle runnable-jar
---
工欲善其事，必先利其器。用好手中的工具，不仅能提高效率，也能实现意料之外的效果。本文介绍使用gradle创建可运行的jar包的方法。

创建可执行jar包有两种方式：
1. 将项目依赖的jar文件解压以后打包到可执行jar包里
2. 将项目依赖的jar文件保持原样打包到可执行jar包里

第1种方式的优点是比较简单，打包后即可直接运行，但缺点也很明显，如有些不同jar包中的关键的文件会相互覆盖，有些被签名的jar包解压后再打包会出现问题，等等。

第2种方式需要借助一下外部加载器，以便在运行时将依赖的jar文件添加到classpath中。

本文使用的是eclipse提供的加载器JarRsrcLoader，事先可以使用eclipse打包一下，然后提取出class文件，并打包成jarloader.jar文件。


{% highlight groovy linenos %}
ext.main = "x.y.z.MainEntry"

apply plugin: "java"

sourceCompatibility = 1.7
targetCompatibility = 1.7

sourceSets {
    main {
        java.srcDirs = ['src']
        resources.srcDirs = ['src']
    }
}

repositories {
    mavenCentral()
}

configurations {
    jarloader
}

dependencies {
    compile fileTree(dir: "lib", includes: ["**/*.jar"])
    //testCompile group: 'junit', name: 'junit', version: '4.12'
    jarloader files("loader/jarloader.jar")
}

task runnableJar1(type: Jar, dependsOn: compileJava) {
    from files(sourceSets.main.output.classesDirs)
    from configurations.runtime.asFileTree.files.collect { zipTree(it) } 
    manifest {
        attributes(
                'Class-Path': '.',
                'Main-Class': "$main"
        )
    }
}

task runnableJar2(type: Jar, dependsOn: compileJava) {
    from files(sourceSets.main.output.classesDirs)
    from configurations.runtime.asFileTree.files.collect { it } 
    from configurations.jarloader.asFileTree.files.collect { zipTree(it) }
    manifest {
        attributes(
                'Class-Path': '.',
                'Main-Class': 'org.eclipse.jdt.internal.jarinjarloader.JarRsrcLoader',
                'Rsrc-Main-Class': "$main",
                'Rsrc-Class-Path': './ ' + configurations.runtime.asFileTree.files*.name.join(" ")
        )
    }
}
{% endhighlight %}

