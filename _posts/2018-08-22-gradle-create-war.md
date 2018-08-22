---
layout: article
title: gradle创建war前先打包class
date:  2018-08-22 11:00:00 +0800
categories: 研发developer
tags: gradle war
---
工欲善其事，必先利其器。用好手中的工具，不仅能提高效率，也能实现意料之外的效果。本文介绍使用gradle创建war前先打包class的方法。

平常在创建war包的时候，往往会把自己的代码放置到WEB-INF/classes目录下。有没有什么办法将代码打包后放置到WEB-INF/lib目录下呢？

有，而且简单得超乎想象。


{% highlight groovy linenos %}
war {
    dependsOn jar
    classpath = jar
}
{% endhighlight %}

