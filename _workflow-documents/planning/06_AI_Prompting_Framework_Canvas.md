# 🤖 AI Prompting Framework & Logic Canvas

## 🎯 Purpose:
Define how AI prompts are structured to produce high-quality, context-aware, monetizable gift ideas. Ensure that tone, structure, and result formatting align with business and UX goals.

---

## 🧩 Prompt Construction Logic

### 🔹 Inputs Collected from User:
- Recipient description (e.g. "my 29-year-old sister who loves yoga and books")
- Interests or hobbies (freeform)
- Budget range
- Optional style preference (e.g. handmade, funny, eco-friendly)

### 🔹 Dynamic Prompt Formula:
```
"Suggest [6–9] [style preference] gift ideas for [recipient description]. 
They enjoy [interests]. Budget is under [$X]. 
Each gift should include a title, a short description, and a product category tag. Style should be reflected in the tone and ideas."
```

### 🔹 Example Prompt:
```
Suggest 8 handmade gift ideas for a 40-year-old dad who loves cooking and hiking. 
Keep each under $50. Focus on artisan, outdoorsy, and kitchen-themed items. 
Return in markdown format with title, short description, and product tag. Style should be prominent in the ideas and tone.
```

---

## 🧠 Output Structure (for AI Parsing & Display)

```markdown
**1. Campfire Spice Kit**  
A handmade blend of spices perfect for cooking outdoors or at home.  
_Tag: Cooking / Outdoors_

**2. Custom Leather Keychain**  
Engraved with initials and handcrafted for everyday carry.  
_Tag: Personalized / Handmade_
```

Parsed into:
- Title
- Description
- Category Tag
- Affiliate Link (mapped post-output)

---

## 🎨 Style Moderator Layer

| Style Preference   | Output Tone             | Affiliate Source           |
|--------------------|--------------------------|----------------------------|
| Handmade           | Warm, artisan-focused    | Etsy                       |
| Unique / Quirky    | Clever, unexpected       | Uncommon Goods             |
| Eco-Friendly       | Sustainable, minimal     | EarthHero, filtered Amazon |
| Funny              | Witty, lighthearted      | Amazon (novelty), UG       |
| Sleek / Techy      | Polished, modern         | Amazon gadgets             |
| Premium / Luxury   | Elegant, exclusive       | Amazon Luxury, brand sites |
| LGBTQ+ Owned       | Inclusive, celebratory   | Etsy, Pride-focused stores |
| BIPOC Owned        | Empowering, diverse      | Etsy, Black-owned directories |

- Style tag inserted directly into the prompt
- Output is routed through a style-specific link selector

---

## 🔄 Output Post-Processing Logic

- Check for tone alignment with style tag
- Match product idea to search keyword
- Query affiliate sources (Amazon, Etsy, etc.) for matching link
- Format output into styled block: title, description, button link

---

## 📤 Prompt Management

| Layer            | Approach                                       |
|------------------|------------------------------------------------|
| Default prompt   | Defined in code with template tokens           |
| Prompt testing   | Weekly review + A/B tests of style impact      |
| Edge cases       | Prompt trims extra input or asks for clarity   |
| Prompt count     | Now requests 6–9 ideas per user request       |

---

## 🟢 Progress Notes
- Updated prompt logic to request 6–9 ideas and make style prominent in both ideas and tone. Prompt builder will be updated accordingly.

---

## 📌 Error & Edge Handling

- If output is too short: re-run with slight rephrase
- If user enters unclear input: AI returns clarification question
- Timeout/failover: show default gift ideas based on trending keywords

---

## 🧪 Prompt QA Strategy

- Weekly prompt-response QA sample (10 outputs)
- Check for tone, length, link match accuracy, and diversity
- Maintain prompt version control (v1, v2, etc.)

---

## 🔮 Future Enhancements

- Prompt memory: let user "refine" previous output
- Personality/MBTI-based prompts
- Occasion-specific prompt variants (wedding, retirement, etc.)
