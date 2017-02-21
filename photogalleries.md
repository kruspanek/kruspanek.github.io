---
layout: page
title: Fotogalerie
permalink: /fotogalerie/
order: 4
---

<p>Fotografie z našich vystoupení a akcí, kterých jsme se účastnili ...</p>

<ul>
{% for photo in site.photogalleries %}
  <li><a  href="{{ photo.url | relative_url }}">{{ photo.title }}</a></li>
{% endfor %}
</ul>
