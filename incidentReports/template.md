# Incident: 2024-12-04 13:35:00

## Summary

The incident had to do with my `jwt-pizza-service`, pretty much there was an error in accessing the pizza factory URL, and due to this, my pizzas were failing. The way I fixed it was by visiting that URL.

## Detection

The detection was internally noticed by me. I had some logging and alerts on different metrics throughout my application. I started to notice that my pizzas were failing, and in my HTTP traffic logs, I was also seeing foreign traffic. Due to that, I was able to deduce the problem.

## Impact

The impact was catastrophic. Due to this, I was fundamentally unable to create pizzas.

## Timeline

- **13:35 MST**: Problem noticed with pizza creation failing.
- **13:45 MST**: Problem completely resolved.

## Root Cause Analysis

The root cause seems to have come from Chaos Monkey, and one of my endpoints was shut down.

## Resolution

I had to visit the link, and the attack stopped.

## Prevention

Don't let the auto-grader traumatize my system again.

## Action Items

- Just look at logs more often.