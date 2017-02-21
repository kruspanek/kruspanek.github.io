---
layout: page
title: Akce
permalink: /akce
order: 3
---

Tady bude seznam akci v podobe jednotlivych postu, tj. nebude se zobrazovat pouze nadchazejici, ale i minule posty s tagem action

<ul class="post-list">

  {% for post in site.tags.akce %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>

      <h2>
        <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
      </h2>
    </li>
  {% endfor %}
</ul>
