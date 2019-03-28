# Localization

### Rendering localized text in HBS templates
Use the `t` helper function and pass the key of the string you wish to render.
```
<p>{{t "research.surveys.p1"}}</p>
```

For strings that require interpolation of variables, use the `__` function in the template and `%s` in the string definition to represent each variable you are passing in:

string definition in en.js:
```
"about.cases.example": "For example, this case on %sParis’s 2017 Participatory Budget%s
is one of over 160 case entries documenting the use of participatory methods to give
citizens stronger influence over the distribution of public resources.",
```

in HBS template:
```
{{{__ "about.cases.example" "<a href='/case/5008'>" "</a>"}}}
```


### Key Best Practices
- for single words and short titles or phrases, use the actual text as the key.
```
{
  "Cases": "Cases",
  "Publish": "Publish",
  "Project Director and Co-Founder": "Project Director and Co-Founder",
}
```

- for page/section specific text use dot-notation to name space pages/sections
```
{
  "about.cases.p1": "Cases are events and instances of participatory politics
   and governance of all shapes and sizes.",

  "about.ckmc.title": "Communications & Knowledge Mobilization Committee",

  "research.tagline": "Participedia is guided by the research question:
   What kinds of participatory processes work best, for what purposes,
   and under what conditions?",
}
```

