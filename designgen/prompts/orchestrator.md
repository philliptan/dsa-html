```
SYSTEM ROLE
------------
You are *FlowDirector*, a logic controller that manages agent execution.

MISSION
--------
Given the pipeline state, decide which agent to call next.

STATE EXAMPLE
--------------
{
  "hasPlan": true,
  "hasMetadata": false,
  "hasCode": false,
  "hasReview": false
}

OUTPUT
-------
{"nextStep":"Retriever"}

RULES
-----
- If !hasPlan → "Decomposer"
- Else if hasPlan && !hasMetadata → "Retriever"
- Else if hasMetadata && !hasCode → "Synthesizer"
- Else if hasCode && !hasReview → "Reviewer"
- Else → "Done"
Return compact JSON only.

```

```
PROJECT CONTEXT
----------------
Design System: ACME UI  
Available categories: Inputs, Layouts, Display, Navigation  
Metadata source: JSON files under /metadata  
Output goal: deterministic, production-quality HTML/JSX

GENERAL RULES
--------------
- Always prefer clarity and consistency over creativity.
- Never hallucinate new tokens, props, or components.
- Always produce valid JSON or code blocks as specified.

```

Below is a **deep, advanced exploration of prompt engineering techniques**
— specifically tailored to **multi-agent, design-to-code** systems like the one you’re building.
This covers prompt structure, injection strategies, context compression, grounding, control tokens, evaluation, and more.

---

## 🧭 1️⃣ Strategic Levels of Prompt Engineering

Prompt engineering happens at **three complementary levels**:

| Level                          | Focus                                                          | Example                                    |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------ |
| **Macro (System Design)**      | Define *roles*, *workflow*, and *prompt boundaries*.           | “Planner → Retriever → CodeGen → Reviewer” |
| **Meso (Prompt Architecture)** | Optimize wording, order, and data injection inside each agent. | Few-shot scaffolding, schema hints         |
| **Micro (Token Control)**      | Manipulate phrasing, separators, temperature, etc.             | “Use triple backticks around code output”  |

Mastering all three gives you predictability, clarity, and scalability.

---

## 🧩 2️⃣ Prompt Architecture Patterns

### 2.1 Instruction Sandwich 🥪

Structure every prompt as:

```
[Role Framing]
[Context / Knowledge]
[Task Instructions]
[Output Format]
[Examples]
```

LLMs follow *first → last* structure strongly — ending with explicit output rules tends to dominate.

---

### 2.2 Three-Tier Context Injection

Inject context at 3 tiers:

1. **Static** → System role & permanent rules (“You are CodeBuilder…”)
2. **Dynamic** → Retrieved metadata or user plan
3. **Ephemeral** → Temporary runtime hints (“Fix these issues: ...”)

Example:

```text
You are CodeBuilder.
[STATIC]
Rules: Use only design system classes.

[DYNAMIC]
Component metadata:
<Button class="btn--primary" />

[EPHEMERAL]
Fix request: user wants outline variant.
```

---

### 2.3 Patterned Output Scaffolding

Teach models your preferred delimiters:

```text
Output only between the markers <RESULT> and </RESULT>.
```

Then post-process deterministically by extracting that block.

This eliminates noise or accidental commentary.

---

### 2.4 JSON Schema Anchoring

Embed schemas directly in the prompt to *anchor output shape*.

```text
Follow this exact JSON schema:
{
  "page": "string",
  "layout": "string",
  "components": [{"type": "string", "props": {}}],
  "features": ["string"]
}
```

LLMs align token prediction strongly to schema shapes; this reduces hallucination.

Combine with `response_format: "json_object"` or OpenAI function calling for double safety.

---

### 2.5 Step-wise Reasoning (Hidden Chain)

Instead of asking the model to “think”, ask for structured intermediate reasoning:

```text
First, list the required UI sections.
Then, list components per section.
Finally, output the combined JSON.
```

Even without revealing “thoughts”, this scaffolds internal reasoning → higher fidelity outputs.

---

## 🧱 3️⃣ Advanced Grounding Techniques

### 3.1 Context Summarization (before injection)

When metadata is long, summarize:

> “Summarize the component JSONs below into a compact list of names, classes, and key props.”

This keeps context under token limits without losing semantic anchors.

---

### 3.2 Retrieval Fusion

Blend **symbolic filters + vector similarity**:

```sql
SELECT * FROM components 
WHERE tags LIKE '%form%' 
AND embedding_similarity(prompt) > 0.8
```

Then insert top-k results in the prompt as mini JSONs.

---

### 3.3 Multi-Modal Grounding

If your design system later includes icons or Figma screenshots,
you can encode these as text descriptors (“[icon: lock] → security visual”)
so the LLM stays text-grounded yet image-aware.

---

### 3.4 Weighted Context Ordering

Order matters. Place:

1. Layouts first
2. Core components second
3. Tokens last

LLMs attend more to earlier context.
If you notice mis-styled outputs, reorder injected snippets.

---

## ⚙️ 4️⃣ Control Techniques for Determinism

| Technique               | Example                       | Purpose                     |
| ----------------------- | ----------------------------- | --------------------------- |
| **Temperature 0.0–0.3** | deterministic code generation | Prevent creative drift      |
| **Top-p = 1.0**         | allow full probability        | Avoid accidental truncation |
| **Stop sequences**      | `"stop": ["</RESULT>"]`       | Cleanly end outputs         |
| **Explicit delimiters** | `<JSON>` ... `</JSON>`        | Easier parsing              |
| **Canonical phrasing**  | “Output valid JSON only”      | Reinforce mode              |

---

## 🧠 5️⃣ Few-Shot Mastery

### 5.1 Minimal Pairs

Show good vs bad outputs:

```
BAD: Adds classes not in design system.
GOOD: Uses only provided classes.
```

LLMs learn boundary conditions better than with only positive examples.

---

### 5.2 Diversity without Drift

Use 2-3 examples that cover:

* Simple form
* Multi-section layout
* Nested components

Beyond 3 examples, models start pattern-copying → less generalization.

---

### 5.3 Context-Aware Few-Shots

Inject examples dynamically based on the task domain:

* If prompt mentions “Auth”, include an auth-related example.
* If “Dashboard”, inject analytics example.

This boosts alignment and lowers token cost.

---

## 🧩 6️⃣ Compression & Context Windows

When you hit token limits:

* **Token Trimming**: Keep only top-k relevant lines from metadata (use cosine similarity on text chunks).
* **Lossless Compression**: Replace long CSS with symbolic placeholders:

  ```
  "css":"{card--centered}"
  ```

* **Progressive Expansion**: Generate code skeleton first, then call LLM again to fill detail slots.

---

## 🧱 7️⃣ Grounded Chain-of-Thought Substitution

Instead of letting the model “think freely”, provide *structured reasoning slots*:

```text
1. Identify user goal:
2. Choose layout:
3. Select components:
4. Generate JSON plan:
```

This yields step-clarity but keeps output deterministic.

---

## 🧩 8️⃣ Error Handling & Self-Correction Prompts

Add reflexive instructions:

```
If output fails schema validation, automatically correct and re-emit.
```

Or have a “repair agent” with this system message:

```text
You are JSONFixer.
Input: possibly invalid JSON.
Output: corrected JSON following previous schema.
```

It can rerun automatically when parsing fails.

---

## 🧪 9️⃣ Evaluation & Optimization Loops

### 9.1 Prompt A/B Testing

Store prompts in files (`/prompts/v1`, `/prompts/v2`)
→ measure:

* JSON validity rate
* Code accuracy
* Token usage

### 9.2 Telemetry Prompts

Ask models to self-score:

```
On a scale of 1-5, how confident are you this output follows all rules?
```

Use that confidence for reruns or ensemble averaging.

---

## 🧩 🔟 Orchestration-Specific Tricks

### 10.1 Context Echoing

Each agent starts by *echoing* the minimal summary of prior state:

```
Previously: Decomposer created 3 components (Input, Button, Card).
Next task: generate HTML.
```

→ keeps coherence without re-injecting entire history.

---

### 10.2 Progressive Prompt Tightening

1. First run → loose creative prompts (“propose layout”)
2. Second run → strict synthesis prompts (“use exact classes”)

This reduces over-constraint early while locking down final code.

---

### 10.3 Memory Window Refresh

If using conversational chains, periodically restate key rules:

> “Reminder: Only use existing metadata classes.”

Otherwise, long contexts cause drift.

---

## ⚙️ 11️⃣ Tool-Assisted Prompt Composition

* **Templating**: use Handlebars or Mustache for variable injection (`{{componentList}}`).
* **Versioning**: commit prompt files separately for reproducibility.
* **Validation pipeline**: after generation → schema validator → auto-retry with “repair” prompt.

---

## 🧠 12️⃣ Example: Synthesizer Prompt with Embedded Techniques

```text
You are CodeBuilder.

REMINDER
---------
Only use classes provided below.
Output code between <RESULT></RESULT>.

CONTEXT
--------
Layout:
{{layout}}

Components:
{{component_snippets}}

Tokens:
{{token_values}}

TASK
-----
Assemble the page described here:
{{plan_json}}

STEPS
------
1. Identify layout wrapper.
2. Insert components in correct order.
3. Replace label props with placeholder text.
4. Validate against metadata.

OUTPUT
-------
<RESULT>
<!-- HTML or JSX -->
</RESULT>

If any required component is missing, add <!-- TODO: missing component --> comment.
```

This single prompt merges:

* role framing
* context injection
* step scaffolding
* delimiters
* fallback handling

---

✅ **Summary**

| Layer     | Technique                                        | Effect      |
| --------- | ------------------------------------------------ | ----------- |
| **Macro** | Role segregation, orchestration                  | Modularity  |
| **Meso**  | Instruction sandwich, few-shot, schema anchoring | Structure   |
| **Micro** | Delimiters, control tokens, temp/stop tuning     | Determinism |

Together they yield **reliable, debuggable, composable prompts** suitable for autonomous multi-agent LLM systems.

---

Would you like me to **continue** into **Step 3 – RAG Retrieval Layer** next (embedding, query ranking, hybrid search, and context injection),
or go even **deeper** here into *prompt optimization metrics* (e.g., quantitative scoring, evaluation datasets, regression testing)?
