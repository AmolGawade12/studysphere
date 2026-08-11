import os
import time

class DemoAIService:
    @staticmethod
    def get_chat_response(conversation_history, prompt):
        # Return intelligent responses based on keywords in prompt
        prompt_lower = prompt.lower()
        
        if "polymorphism" in prompt_lower:
            return (
                "### Java Polymorphism Explained Simply 🤖\n\n"
                "Polymorphism is one of the core concepts of Object-Oriented Programming (OOP). "
                "The word comes from Greek words meaning *'many forms'*.\n\n"
                "In Java, polymorphism allows us to perform a single action in different ways. "
                "There are two main types:\n\n"
                "1. **Compile-time Polymorphism (Method Overloading)**: Overloading occurs when multiple methods "
                "in the same class have the same name but different parameters.\n"
                "   ```java\n"
                "   class Helper {\n"
                "       int Multiply(int a, int b) { return a * b; }\n"
                "       double Multiply(double a, double b) { return a * b; }\n"
                "   }\n"
                "   ```\n\n"
                "2. **Runtime Polymorphism (Method Overriding)**: Overriding occurs when a child class "
                "provides a specific implementation of a method already defined in its parent class. "
                "Java resolves this call at runtime.\n"
                "   ```java\n"
                "   class Animal { void sound() { System.out.println(\"Animal sound\"); } }\n"
                "   class Dog extends Animal { void sound() { System.out.println(\"Bark\"); } }\n"
                "   ```\n\n"
                "**Key Benefit**: It makes code highly reusable and clean, permitting you to handle generic animal collections without knowing the specific breed until runtime."
            )
        elif "inheritance" in prompt_lower:
            return (
                "### Inheritance in Java 🧬\n\n"
                "Inheritance is a mechanism in Java in which one class acquires the properties and behaviors "
                "of a parent class. It is represented by the `extends` keyword.\n\n"
                "**Key Terms:**\n"
                "- **Super Class (Parent)**: The class whose features are inherited.\n"
                "- **Sub Class (Child)**: The class that inherits the other class.\n\n"
                "Example:\n"
                "```java\n"
                "class Vehicle {\n"
                "    int speed = 60;\n"
                "}\n"
                "class Car extends Vehicle {\n"
                "    int wheels = 4;\n"
                "}\n"
                "```\n"
                "Here, `Car` automatically gains access to `speed` from `Vehicle`.\n\n"
                "Note: Java does *not* support multiple inheritance with classes (e.g., inheriting from two classes at once) to avoid ambiguity, but supports it through interfaces."
            )
        elif "dsa" in prompt_lower or "tree" in prompt_lower or "data structure" in prompt_lower:
            return (
                "### Data Structures: Trees 🌳\n\n"
                "A Tree is a hierarchical, non-linear data structure consisting of nodes connected by edges. "
                "Unlike arrays or linked lists, which are linear, trees represent hierarchical relationships (like a file directory system).\n\n"
                "**Core Terminology:**\n"
                "- **Root**: The topmost node of the tree.\n"
                "- **Parent / Child**: Nodes connected directly; the higher one is the parent.\n"
                "- **Leaf Node**: A node with no children.\n"
                "- **Subtree**: Any node and its descendants.\n\n"
                "**Binary Search Tree (BST) Rule:**\n"
                "For any node:\n"
                "- The value of the **left** subtree is *less than* the node's value.\n"
                "- The value of the **right** subtree is *greater than* the node's value."
            )
        elif "summarize" in prompt_lower or "summary" in prompt_lower:
            return (
                "### Study Summary 📝\n\n"
                "- **Key Concept**: Core learning concepts must be structured logically for retrieval.\n"
                "- **Active Recall**: The most effective way to remember is testing yourself (flashcards or quizzes).\n"
                "- **Spaced Repetition**: Re-evaluate the subject in expanding time intervals (1 day, 3 days, 7 days).\n\n"
                "Let me know if you would like me to generate practice questions based on this topic!"
            )
        else:
            return (
                f"### StudySphere AI Tutor Response 🤖\n\n"
                f"I've received your query: *\"{prompt}\"*.\n\n"
                f"Here are some helpful starting steps to master this topic:\n\n"
                f"1. **Break it down**: Isolate key terms and concepts.\n"
                f"2. **Map the relationships**: Draw a quick diagram linking concepts.\n"
                f"3. **Practice**: Try writing a code snippet or generating a quick quiz.\n\n"
                f"Is there a specific detail or code snippet you would like me to explain or write out?"
            )

    @staticmethod
    def get_summary(text_to_summarize):
        if not text_to_summarize:
            return "No text provided for summarization."
        
        preview = text_to_summarize[:100] + "..." if len(text_to_summarize) > 100 else text_to_summarize
        return (
            f"### AI Note Summary 📄\n\n"
            f"*Processed text starting with: \"{preview}\"*\n\n"
            f"**1. Core Topics Identified:**\n"
            f"- Fundamental architectural components and variables.\n"
            f"- Class structures, function configurations, and logic paths.\n\n"
            f"**2. Main Definitions & Formulas:**\n"
            f"- Defined entities and methods described in the text.\n"
            f"- Relational mappings between structures.\n\n"
            f"**3. Key Summary Takeaways:**\n"
            f"- Maintain clean styling formatting throughout variables.\n"
            f"- Keep code modular and testable.\n"
            f"- Optimize performance loops for larger workloads."
        )

    @staticmethod
    def generate_questions(text_content, difficulty="Medium", num_questions=5):
        # Fallback list of questions
        questions = [
            {
                "question": "Which of the following describes Method Overloading?",
                "option_a": "Defining two methods with the same name and arguments in subclasses",
                "option_b": "Defining two methods with the same name but different signatures in the same class",
                "option_c": "Defining a method in an interface and implementing it in a class",
                "option_d": "None of the above",
                "correct_answer": "B",
                "explanation": "Method overloading allows a class to have multiple methods with the same name, as long as their parameter lists are different."
            },
            {
                "question": "What is the time complexity of searching in a balanced Binary Search Tree?",
                "option_a": "O(N)",
                "option_b": "O(N log N)",
                "option_c": "O(log N)",
                "option_d": "O(1)",
                "correct_answer": "C",
                "explanation": "In a balanced BST, the height is log N. Since each comparison divides the search space in half, searching takes O(log N) time."
            },
            {
                "question": "Which keyword is used by a class to inherit from an interface in Java?",
                "option_a": "extends",
                "option_b": "implements",
                "option_c": "inherits",
                "option_d": "super",
                "correct_answer": "B",
                "explanation": "In Java, a class uses the 'implements' keyword to implement an interface, and the 'extends' keyword to extend another class."
            },
            {
                "question": "What does a 'final' class mean in Java?",
                "option_a": "The class cannot be instantiated",
                "option_b": "The class cannot have any variables",
                "option_c": "The class cannot be subclassed (inherited from)",
                "option_d": "The class is ready for garbage collection",
                "correct_answer": "C",
                "explanation": "A 'final' class in Java cannot be inherited. It prevents any subclasses from extending it."
            },
            {
                "question": "What is the main purpose of garbage collection in Python?",
                "option_a": "To speed up loop executions",
                "option_b": "To automatically release unused memory allocations",
                "option_c": "To check syntax errors at compilation time",
                "option_d": "To encrypt user password data",
                "correct_answer": "B",
                "explanation": "Python's garbage collector automatically deletes objects that no longer have any active references to reclaim memory."
            }
        ]
        return questions[:min(num_questions, len(questions))]

def get_ai_service():
    provider = os.getenv("AI_PROVIDER", "demo").lower()
    if provider == "demo" or not os.getenv("AI_API_KEY"):
        return DemoAIService()
    # In the future, a real service utilizing OpenAI, Gemini or Anthropic can be configured here.
    return DemoAIService()
