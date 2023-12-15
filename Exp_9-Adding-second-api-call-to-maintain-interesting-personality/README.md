## Exp_9 - Adding second api call to maintain interesting personality
<br>

### Objective
- Adding instructions to the system message made the personality less interesting.
- To solve the problem I added a seperate api call that contained instructions to check for errors, translate into thai and output json.
  
### Notes
- This approach worked. The code returns json and the interesting personality is maintained.
- However, I think the language of this personality is too casual for a chatbot that's meant to help people learn good quality english.
- The ouput is also a bit long and maybe too whimsical for non english speakers to understand. It's also harder to accurately translate into thai.

