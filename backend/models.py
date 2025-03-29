from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase
from config import db


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    handle: Mapped[str] = mapped_column(db.String(70), primary_key=True)
    registrationTimeSeconds: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return f"User(handle={self.handle!r}, registrationTimeSeconds={self.registrationTimeSeconds!r})"

    def to_dict(self):
        return {
            'handle': self.handle,
            'registrationTimeSeconds': self.registrationTimeSeconds
        }


class Contest(Base):
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
    __tablename__ = "problems"

    contest_id: Mapped[int] = mapped_column(db.ForeignKey("contests.id", ondelete="CASCADE"), primary_key=True)
    index: Mapped[str] = mapped_column(db.String(5), primary_key=True)
    rating: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    success_trials: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    unsuccess_trials: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return (f"Problem(contest_id={self.contest_id!r}, index={self.index!r}, rating={self.rating!r}, "
                f"success_trials={self.success_trials!r}, unsuccess_trials={self.unsuccess_trials!r})")

    def to_dict(self):
        return {
            'contest_id': self.contest_id,
            'index': self.index,
            'rating': self.rating,
            'success_trials': self.success_trials,
            'unsuccess_trials': self.unsuccess_trials
        }


class Blog(Base):
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
    __tablename__ = "participations"

    user_handle: Mapped[str] = mapped_column(db.ForeignKey("users.handle", ondelete="CASCADE"), primary_key=True)
    contest_id: Mapped[int] = mapped_column(db.ForeignKey("contests.id", ondelete="CASCADE"), primary_key=True)
    rank: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    new_rating: Mapped[int] = mapped_column(db.Integer(), nullable=False)
    rating_change: Mapped[int] = mapped_column(db.Integer(), nullable=False)

    def __repr__(self):
        return (f"Participation(user_handle={self.user_handle!r}, contest_id={self.contest_id!r}, rank={self.rank!r}, "
                f"new_rating={self.new_rating!r}, rating_change={self.rating_change!r})")

    def to_dict(self):
        return {
            'user_handle': self.user_handle,
            'contest_id': self.contest_id,
            'rank': self.rank,
            'new_rating': self.new_rating,
            'rating_change': self.rating_change
        }


class Solution(Base):
    __tablename__ = "solutions"

    user_handle: Mapped[str] = mapped_column(db.ForeignKey("users.handle", ondelete="CASCADE"), primary_key=True)
    problem_contest_id: Mapped[int] = mapped_column(db.Integer(), primary_key=True)
    problem_index: Mapped[str] = mapped_column(db.String(5), primary_key=True)
    timeSeconds: Mapped[int] = mapped_column(db.Integer(), nullable=False)

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
    __tablename__ = "problem_tags"

    problem_contest_id: Mapped[int] = mapped_column(db.Integer(), primary_key=True)
    problem_index: Mapped[str] = mapped_column(db.String(5), primary_key=True)
    tag: Mapped[str] = mapped_column(db.String(50), primary_key=True)

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
    __tablename__ = "blog_tags"

    blog_id: Mapped[int] = mapped_column(db.ForeignKey("blogs.id", ondelete="CASCADE"), primary_key=True)
    tag: Mapped[str] = mapped_column(db.String(100), primary_key=True)

    def __repr__(self):
        return f"BlogTag(blog_id={self.blog_id!r}, tag={self.tag!r})"

    def to_dict(self):
        return {
            'blog_id': self.blog_id,
            'tag': self.tag
        }
