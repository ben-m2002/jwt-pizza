# Curiosity Report: Chrome DevTools Tabs

## Introduction
Chrome Developer Tools (DevTools) is one of those tools every web developer deems very useful. I came to realize that aside from the sources tab, the output, and netowrk tab
I am not very familiar with the other tabs, so I decided to find out what they had to offer.
---

## **1. Lighthouse Tab**
The **Lighthouse** tab is like having a little assistant that audits your website for you. It’s super helpful if you want to make your site better but aren’t sure where to start. Here’s what it checks:

- **Performance**: It looks at how fast your page loads and tells you if something is slowing it down, like huge images or slow JavaScript.
- **Accessibility**: This part is really important—it checks if your site is usable for people with disabilities. Things like missing alt text on images or bad color contrast get flagged here.
- **SEO**: If you care about your site showing up in Google search results, this is for you. It checks things like metadata and mobile-friendliness.
- **Best Practices**: It’s like a checklist for modern web development—stuff like avoiding outdated APIs or insecure resources.
- **Progressive Web Apps (PWAs)**: If your site is a PWA, Lighthouse makes sure it has all the right features, like offline support and a proper manifest file.

When you run Lighthouse, it gives you a detailed report with scores for each category and suggestions for improvement. It’s kind of like getting a grade for your site with extra credit tips. Honestly, it’s great for finding small fixes that make a big difference.

---

## **2. Accessibility Tab**
The **Accessibility** tab focuses on making websites better for everyone, especially people using screen readers or other assistive tech. Accessibility might not seem like a big deal at first, but it’s actually super important. Here’s what this tab helps with:

- **ARIA Roles**: ARIA stands for Accessible Rich Internet Applications. It sounds fancy, but it’s just about making sure elements on your site are labeled properly so screen readers can describe them.
- **Focus Management**: If you’ve ever tried to navigate a site using only the keyboard, you know how frustrating it can be when the focus jumps all over the place. This tab helps you make sure focus moves logically.
- **Color Contrast**: It checks if the colors on your site have enough contrast to be readable. For example, gray text on a light gray background? Probably not gonna pass.
- **Landmarks and Labels**: These help assistive tools understand the structure of your site. It’s like giving directions to someone who can’t see the page.
- **Simulated Screen Reader Output**: This lets you preview how screen readers interpret your site, so you can catch any mistakes.

This tab is a must use if you want to make sure your site is useable for everyone.

---

## **3. Experiments Tab**
The **Experiments** tab is where Chrome hides all the cool, in-progress features. It’s kind of like a beta testing zone for DevTools. If you want to explore new or experimental tools, this is the place to go. Here’s how it works:

- **How to Enable It**: You can find it in the DevTools settings under the "Experiments" section. You just check a box to enable whatever experiment you want to try out.
- **What’s In It?**: The experiments change depending on what Chrome is working on, but some common ones include:
  - **Performance Insights**: Gives you even deeper performance metrics than the regular Performance tab.
  - **Source Map Enhancements**: Helps you debug minified or transpiled code more easily.
  - **Custom Formatters**: Lets you create custom views for your data in the Console tab.
  - **New Debuggers or Protocols**: Sometimes they add experimental tools for upcoming web standards or APIs.

These features might be a little unstable since they’re experimental, but they’re a lot of fun to play around with if you want to see what’s coming next in web development.

---

## Conclusion
Overall, DevTools is way more than just a way to fix CSS bugs. The **Lighthouse**, **Accessibility**, and **Experiments** tabs stood out to me because they go beyond just debugging—they help you actually improve your site in meaningful ways. Whether it’s making your site faster, more inclusive, or just trying out some cool tools, there’s a lot to explore. I 
still have a lot to learn but I am super thankful for this report because it helped me lay a foundation of learning.