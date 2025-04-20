from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase
from config import db


# Base class for declarative model definitions
class Base(DeclarativeBase):
    """Base class for all database models using SQLAlchemy ORM"""
    pass


class User(Base):
    """Represents a user in the system.

    Attributes:
        handle: Unique user identifier (primary key)
        registrationTimeSeconds: Unix timestamp of user registration
    """
    __tablename__ = "users"

    handle: Mapped[str] = mapped_column(db.String(70), primary_key=True)
    registrationTimeSeconds: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        """Official string representation for debugging"""
        return f"User(handle={self.handle!r}, registrationTimeSeconds={self.registrationTimeSeconds!r})"

    def to_dict(self):
        """Serialize model to dictionary for API responses"""
        return {
            'handle': self.handle,
            'registrationTimeSeconds': self.registrationTimeSeconds
        }


class Contest(Base):
    """Represents a programming competition event.

    Attributes:
        id: Unique contest identifier (primary key)
        startTimeSeconds: Unix timestamp of contest start time
    """
    __tablename__ = "contests"

    id: Mapped[int] = mapped_column(db.Integer(), primary_key=True)
    startTimeSeconds: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return f"Contest(id={self.id!r}, startTimeSeconds={self.startTimeSeconds!r})"

    def to_dict(self):
        return {
            'id': self.id,
            'startTimeSeconds': self.startTimeSeconds
        }


class Problem(Base):
    """Represents a programming problem in the system.

    Attributes:
        contest_id: Foreign key to parent contest (part of composite key)
        index: Problem index within contest (part of composite key)
        rating: Difficulty rating of the problem
        success_trials: Number of successful submissions
        unsuccess_trials: Number of failed submissions
    """
    __tablename__ = "problems"

    contest_id: Mapped[int] = mapped_column(
        db.ForeignKey("contests.id", ondelete="CASCADE"),
        primary_key=True
    )
    index: Mapped[str] = mapped_column(db.String(5), primary_key=True)
    rating: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    success_trials: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    unsuccess_trials: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return (f"Problem(contest_id={self.contest_id!r}, index={self.index!r}, "
                f"rating={self.rating!r}, success_trials={self.success_trials!r}, "
                f"unsuccess_trials={self.unsuccess_trials!r})")

    def to_dict(self):
        return {
            'contest_id': self.contest_id,
            'index': self.index,
            'rating': self.rating,
            'success_trials': self.success_trials,
            'unsuccess_trials': self.unsuccess_trials
        }


class Blog(Base):
    """Represents a blog post in the system.

    Attributes:
        id: Unique blog identifier (primary key)
        title: Blog post title (max 150 chars)
        rating: Average user rating of the blog
        numberOfComments: Total number of comments received
    """
    __tablename__ = "blogs"

    id: Mapped[int] = mapped_column(db.Integer(), primary_key=True)
    title: Mapped[str] = mapped_column(db.String(150), nullable=False)
    rating: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    numberOfComments: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return f"Blog(id={self.id!r}, title={self.title!r}, rating={self.rating!r}, numberOfComments={self.numberOfComments!r})"

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'rating': self.rating,
            'numberOfComments': self.numberOfComments
        }


class Participation(Base):
    """Represents a user's participation in a contest.

    Attributes:
        user_handle: Foreign key to participating user (part of composite key)
        contest_id: Foreign key to contest (part of composite key)
        rank: User's final ranking in the contest
        new_rating: User's rating after contest
        rating_change: Delta from previous rating
    """
    __tablename__ = "participations"

    user_handle: Mapped[str] = mapped_column(
        db.ForeignKey("users.handle", ondelete="CASCADE"),
        primary_key=True
    )
    contest_id: Mapped[int] = mapped_column(
        db.ForeignKey("contests.id", ondelete="CASCADE"),
        primary_key=True
    )
    rank: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    new_rating: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    rating_change: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return (f"Participation(user_handle={self.user_handle!r}, contest_id={self.contest_id!r}, "
                f"rank={self.rank!r}, new_rating={self.new_rating!r}, rating_change={self.rating_change!r})")

    def to_dict(self):
        return {
            'user_handle': self.user_handle,
            'contest_id': self.contest_id,
            'rank': self.rank,
            'new_rating': self.new_rating,
            'rating_change': self.rating_change
        }


class Solution(Base):
    """Represents a user's solution to a problem.

    Attributes:
        user_handle: Foreign key to solving user (part of composite key)
        problem_contest_id: Foreign key to problem's contest (part of composite key)
        problem_index: Foreign key to problem index (part of composite key)
        timeSeconds: Timestamp of solution submission
    """
    __tablename__ = "solutions"

    user_handle: Mapped[str] = mapped_column(
        db.ForeignKey("users.handle", ondelete="CASCADE"),
        primary_key=True
    )
    problem_contest_id: Mapped[int] = mapped_column(db.Integer(), primary_key=True)
    problem_index: Mapped[str] = mapped_column(db.String(5), primary_key=True)
    timeSeconds: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    # Composite foreign key to problems table
    __table_args__ = (
        db.ForeignKeyConstraint(
            ["problem_contest_id", "problem_index"],
            ["problems.contest_id", "problems.index"]
        ),
    )

    def __repr__(self):
        return (f"Solution(user_handle={self.user_handle!r}, problem_contest_id={self.problem_contest_id!r}, "
                f"problem_index={self.problem_index}, timeSeconds={self.timeSeconds!r})")

    def to_dict(self):
        return {
            'user_handle': self.user_handle,
            'problem_contest_id': self.problem_contest_id,
            'problem_index': self.problem_index,
            'timeSeconds': self.timeSeconds
        }


class ProblemTag(Base):
    """Represents tags associated with problems (many-to-many relationship).

    Attributes:
        problem_contest_id: Foreign key to problem's contest (part of composite key)
        problem_index: Foreign key to problem index (part of composite key)
        tag: Problem category/tag (part of composite key)
    """
    __tablename__ = "problem_tags"

    problem_contest_id: Mapped[int] = mapped_column(db.Integer(), primary_key=True)
    problem_index: Mapped[str] = mapped_column(db.String(5), primary_key=True)
    tag: Mapped[str] = mapped_column(db.String(50), primary_key=True)

    # Composite foreign key to problems table
    __table_args__ = (
        db.ForeignKeyConstraint(
            ["problem_contest_id", "problem_index"],
            ["problems.contest_id", "problems.index"]
        ),
    )

    def __repr__(self):
        return f"ProblemTag(contest_id={self.problem_contest_id!r}, problem_index={self.problem_index}, tag={self.tag!r})"

    def to_dict(self):
        return {
            'problem_contest_id': self.problem_contest_id,
            'problem_index': self.problem_index,
            'tag': self.tag
        }


class BlogTag(Base):
    """Represents tags associated with blog posts (many-to-many relationship).

    Attributes:
        blog_id: Foreign key to blog post (part of composite key)
        tag: Blog category/tag (part of composite key)
    """
    __tablename__ = "blog_tags"

    blog_id: Mapped[int] = mapped_column(
        db.ForeignKey("blogs.id", ondelete="CASCADE"),
        primary_key=True
    )
    tag: Mapped[str] = mapped_column(db.String(100), primary_key=True)

    def __repr__(self):
        return f"BlogTag(blog_id={self.blog_id!r}, tag={self.tag!r})"

    def to_dict(self):
        return {
            'blog_id': self.blog_id,
            'tag': self.tag
        }
