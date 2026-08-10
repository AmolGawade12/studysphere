import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from accounts.models import Profile
from subjects.models import Subject
from notes.models import Note
from planner.models import Task
from quizzes.models import Quiz, Question, QuizResult
from study_sessions.models import StudySession
from notifications.models import Notification

def seed():
    print("Seeding database...")
    
    # 1. Create student user
    username = 'student'
    email = 'student@studysphere.ai'
    password = 'password123'
    
    # Delete existing user if exists to restart cleanly
    User.objects.filter(username=username).delete()
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name='Alex',
        last_name='Carter'
    )
    user.is_superuser = True
    user.is_staff = True
    user.save()
    
    # Generate Auth Token
    Token.objects.get_or_create(user=user)
    
    # Update Profile
    profile = user.profile
    profile.name = "Alex Carter"
    profile.college = "Tech University"
    profile.course = "Computer Science"
    profile.year = "3rd Year"
    profile.save()
    
    print(f"Created user: {username} / {password}")

    # 2. Create Subjects
    java = Subject.objects.create(
        user=user,
        name="Java Programming",
        description="Object-oriented programming and application development in Java.",
        progress=75,
        study_hours=18.5,
        color="#6366f1" # Indigo
    )
    python = Subject.objects.create(
        user=user,
        name="Python Basics",
        description="Core concepts of Python, scripting, and basics of algorithms.",
        progress=60,
        study_hours=12.0,
        color="#3b82f6" # Blue
    )
    dsa = Subject.objects.create(
        user=user,
        name="Data Structures & Algorithms",
        description="Arrays, LinkedLists, Stacks, Queues, Trees, Graphs, Sorting, and Searching.",
        progress=50,
        study_hours=15.0,
        color="#a855f7" # Purple
    )
    networks = Subject.objects.create(
        user=user,
        name="Computer Networks",
        description="OSI Model, TCP/IP, routing protocols, IP addressing, and socket programming.",
        progress=40,
        study_hours=8.0,
        color="#06b6d4" # Cyan
    )
    print("Created subjects.")

    # 3. Create Notes with Extracted Text
    Note.objects.create(
        user=user,
        subject=java,
        title="Java OOP Overview.pdf",
        file="notes/java_oop.pdf",
        file_type="PDF",
        file_size="1.2 MB",
        extracted_text=(
            "Java is an object-oriented programming language designed to have as few implementation "
            "dependencies as possible. Polymorphism allows one interface to represent multiple "
            "implementations. Method overloading is compile-time polymorphism. Method overriding is "
            "runtime polymorphism. Classes serve as blueprints for objects. Encapsulation restricts "
            "direct access to object details. Inheritance enables a class to acquire properties of another."
        )
    )
    Note.objects.create(
        user=user,
        subject=java,
        title="Java Inheritance.pdf",
        file="notes/java_inheritance.pdf",
        file_type="PDF",
        file_size="850 KB",
        extracted_text=(
            "Inheritance in Java is a mechanism in which one object acquires all the properties and behaviors "
            "of a parent object. It is an important part of OOPs. The idea behind inheritance in Java is that "
            "you can create new classes that are built upon existing classes. When you inherit from an existing "
            "class, you can reuse methods and fields of the parent class. Key terms: subclass (child), subclass inherits, "
            "superclass (parent), extends keyword."
        )
    )
    Note.objects.create(
        user=user,
        subject=python,
        title="Python Functions.pdf",
        file="notes/python_functions.pdf",
        file_type="PDF",
        file_size="920 KB",
        extracted_text=(
            "A function is a block of code which only runs when it is called. You can pass data, known as parameters, "
            "into a function. A function can return data as a result. In Python, a function is defined using the def "
            "keyword. Arguments are specified after the function name, inside the parentheses. You can add as many "
            "arguments as you want, just separate them with a comma."
        )
    )
    Note.objects.create(
        user=user,
        subject=dsa,
        title="DSA Trees.pdf",
        file="notes/dsa_trees.pdf",
        file_type="PDF",
        file_size="1.5 MB",
        extracted_text=(
            "A tree is a non-linear hierarchical data structure that consists of nodes connected by boundaries. "
            "Binary Search Tree (BST) is a node-based binary tree data structure which has the following properties: "
            "The left subtree of a node contains only nodes with keys lesser than the parent node's key. The right subtree "
            "contains only nodes with keys greater than the parent node's key. Time complexity of searching is O(log N)."
        )
    )
    print("Created notes.")

    # 4. Create Planner Tasks
    today = timezone.now().date()
    Task.objects.create(
        user=user,
        subject=java,
        title="Study Java Inheritance",
        description="Read pages 10-15 of Java Inheritance note, write inheritance sample code.",
        due_date=today + timedelta(days=1),
        duration=45,
        priority="High",
        completed=False
    )
    Task.objects.create(
        user=user,
        subject=python,
        title="Complete Python Functions",
        description="Do practice exercises for def statements, keyword args and lambda.",
        due_date=today,
        duration=30,
        priority="Medium",
        completed=True
    )
    Task.objects.create(
        user=user,
        subject=dsa,
        title="Revise DSA Trees",
        description="Implement BST inserts, deletes, and traversals in Python.",
        due_date=today + timedelta(days=3),
        duration=60,
        priority="High",
        completed=False
    )
    print("Created tasks.")

    # 5. Create Study Sessions (Last 7 Days)
    for i in range(7):
        day = today - timedelta(days=i)
        # Seed random hours corresponding to:
        # Monday (6 days ago): 1.5h (90m), Tuesday: 2h (120m), Wednesday: 1h (60m), Thursday: 2.5h (150m), Friday: 1.5h (90m), Saturday: 3h (180m), Sunday: 2h (120m)
        durations = [120, 180, 90, 150, 60, 120, 90] # reversed mapping or matching indices
        duration = durations[i % len(durations)]
        
        session = StudySession.objects.create(
            user=user,
            subject=java if i % 2 == 0 else dsa,
            duration=duration,
            session_type='study'
        )
        # Override auto auto_now_add creation date for charting purposes
        session.created_at = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time())) + timedelta(hours=14)
        session.save()
    print("Created study sessions.")

    # 6. Create Quizzes & Results
    # Quiz 1
    java_quiz = Quiz.objects.create(
        user=user,
        subject=java,
        title="Java OOP Principles",
        topic="OOP Foundations",
        difficulty="Medium",
        total_questions=4
    )
    Question.objects.create(
        quiz=java_quiz,
        question="Which keyword is used for inheritance in Java?",
        option_a="implements",
        option_b="extends",
        option_c="inherit",
        option_d="super",
        correct_answer="B",
        explanation="Java uses the 'extends' keyword to inherit properties and methods from a parent class."
    )
    Question.objects.create(
        quiz=java_quiz,
        question="Which concept supports compile-time polymorphism?",
        option_a="Method Overriding",
        option_b="Method Overloading",
        option_c="Interface Implementation",
        option_d="Abstraction",
        correct_answer="B",
        explanation="Method Overloading involves defining multiple methods in the same class with same name but different signatures. Resolved at compile-time."
    )
    Question.objects.create(
        quiz=java_quiz,
        question="What prevents a class from being inherited in Java?",
        option_a="static keyword",
        option_b="abstract keyword",
        option_c="final keyword",
        option_d="private keyword",
        correct_answer="C",
        explanation="Classes declared with the 'final' keyword cannot be subclassed or extended."
    )
    Question.objects.create(
        quiz=java_quiz,
        question="What is encapsulation?",
        option_a="Hiding data details under private fields and exposing via public getters/setters",
        option_b="Inheriting subclasses",
        option_c="Writing polymorphic constructors",
        option_d="Overriding parent methods",
        correct_answer="A",
        explanation="Encapsulation is wrapping code and data together into a single unit, hiding variables behind getters/setters."
    )
    
    # Save a result for Java
    QuizResult.objects.create(
        user=user,
        quiz=java_quiz,
        score=3,
        total=4,
        percentage=75.0
    )

    # Quiz 2
    python_quiz = Quiz.objects.create(
        user=user,
        subject=python,
        title="Python Functions Quiz",
        topic="Basic Functions",
        difficulty="Easy",
        total_questions=2
    )
    Question.objects.create(
        quiz=python_quiz,
        question="Which keyword defines a function in Python?",
        option_a="function",
        option_b="def",
        option_c="func",
        option_d="define",
        correct_answer="B",
        explanation="Python uses the 'def' keyword to start a function definition block."
    )
    Question.objects.create(
        quiz=python_quiz,
        question="What is a lambda function in Python?",
        option_a="A function that is recursive",
        option_b="An anonymous, one-line function",
        option_c="A special type of method override",
        option_d="A decorator pattern",
        correct_answer="B",
        explanation="Lambdas are small, anonymous, inline functions created with the 'lambda' keyword."
    )
    
    # Save a result for Python
    QuizResult.objects.create(
        user=user,
        quiz=python_quiz,
        score=2,
        total=2,
        percentage=100.0
    )
    
    print("Created quizzes and results.")

    # 7. Create Notifications
    Notification.objects.create(
        user=user,
        title="Java task is due today.",
        message="Your planner task 'Study Java Inheritance' is due by end of the day today.",
        read=False
    )
    Notification.objects.create(
        user=user,
        title="Quiz completed — 100%.",
        message="Great job! You achieved 100% on the Python Functions Quiz.",
        read=True
    )
    Notification.objects.create(
        user=user,
        title="You studied for 2 hours today.",
        message="Nice focus streak! You logged 120 minutes of study session today.",
        read=True
    )
    print("Created notifications.")
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
