from collections import defaultdict
from functools import lru_cache
from config import db
import time


def timed_cache(seconds):
    def decorator(func):
        @lru_cache(maxsize=None)
        def cached_func(*args, **kwargs):
            return func(*args, **kwargs)

        def wrapper(*args, **kwargs):
            result = cached_func(*args, **kwargs)
            if time.time() - wrapper.last_reset > seconds:
                cached_func.cache_clear()
                wrapper.last_reset = time.time()
            return result

        wrapper.last_reset = time.time()
        return wrapper

    return decorator


@timed_cache(seconds=3600*24)
def get_topics():
    topics = db.session.execute(db.text(
        """SELECT DISTINCT tag FROM problem_tags;"""
    )).all()
    topics = [topic[0] for topic in topics]
    return topics


@timed_cache(seconds=3600*24)
def get_topics_distribution_by_rating():
    topic_rating_distribution = db.session.execute(db.text(
        """
        SELECT pt.tag, p.rating, count(*)
        FROM problem_tags AS pt
        JOIN problems AS p ON pt.problem_contest_id = p.contest_id AND pt.problem_index = p.index
        GROUP BY pt.tag, p.rating
        ORDER BY pt.tag, p.rating
        """
    )).all()
    topic_rating_distribution = [{
        "topic": item[0],
        "rating": item[1],
        "number_of_tasks": item[2]} for item in topic_rating_distribution
    ]
    return topic_rating_distribution


@timed_cache(seconds=3600*24)
def get_topics_correlation():
    topics_correlation = db.session.execute(db.text(
        """
        SELECT pt1.tag, pt2.tag, count(*)
        FROM problem_tags AS pt1
        JOIN problem_tags AS pt2
            ON pt1.problem_contest_id = pt2.problem_contest_id AND pt1.problem_index = pt2.problem_index
        GROUP BY pt1.tag, pt2.tag
        ORDER BY pt1.tag, pt2.tag
        """
    )).all()
    topics_correlation = [{
        "topic1": item[0],
        "topic2": item[1],
        "number_of_tasks": item[2]} for item in topics_correlation
    ]
    return topics_correlation


@timed_cache(seconds=3600*24)
def get_topics_solvability():
    topic_trials = db.session.execute(db.text(
        """
        SELECT pt.tag, SUM(p.success_trials), (SUM(p.success_trials) + SUM(p.unsuccess_trials))
        FROM problem_tags AS pt
        JOIN problems AS p ON pt.problem_contest_id = p.contest_id AND pt.problem_index = p.index
        GROUP BY pt.tag
        """
    )).all()
    topics_solvability = [{
        "topic": item[0],
        "solvability": item[1] / item[2]
    } for item in topic_trials]
    return topics_solvability


@timed_cache(seconds=3600*24)
def get_rating_distribution_by_experience():
    rated_experience = db.session.execute(db.text(
        """
        WITH user_last_contest AS (
            SELECT p.user_handle, MAX(contests.id) AS contest_id,
                    MAX("startTimeSeconds") AS startTimeSeconds
            FROM participations AS p
            JOIN contests ON p.contest_id = contests.id
            GROUP BY p.user_handle
        )
        SELECT p.new_rating AS rating,
                ((ulc.startTimeSeconds - "registrationTimeSeconds") / (3600 * 24 * 365)) AS experience
        FROM users AS u
        JOIN user_last_contest AS ulc ON u.handle = ulc.user_handle
        JOIN participations AS p ON u.handle = p.user_handle AND p.contest_id = ulc.contest_id
        WHERE p.rating_change <= 250
        ORDER BY p.new_rating
        """
    )).all()

    rated_experience_dict = defaultdict(list)

    for item in rated_experience:
        rated_experience_dict['rating'].append(item[0])
        rated_experience_dict['time_registration_years'].append(item[1])

    return rated_experience_dict


@timed_cache(seconds=3600*24)
def get_rating_distribution_by_solutions_amount():
    rated_solution_number = db.session.execute(db.text(
        """
        SELECT p.new_rating AS rating, count(*) AS number_of_solutions, p.user_handle
        FROM participations AS p
        JOIN solutions AS s ON p.user_handle = s.user_handle
        WHERE p.rating_change <= 250
        GROUP BY p.user_handle, p.new_rating
        ORDER BY p.new_rating
        """
    )).all()

    rated_solution_number_dict = defaultdict(list)

    for item in rated_solution_number:
        rated_solution_number_dict['rating'].append(item[0])
        rated_solution_number_dict['time_registration_years'].append(item[1])

    return rated_solution_number_dict


@timed_cache(seconds=3600*24)
def get_rating_distribution_by_solutions_rating():
    rating_correlation = db.session.execute(db.text(
        """
        SELECT pt.new_rating AS rating,
                AVG(pb.rating) AS avg_solutions_rating, pt.user_handle
        FROM participations AS pt
        JOIN solutions AS s ON pt.user_handle = s.user_handle
        JOIN problems AS pb ON s.problem_contest_id = pb.contest_id AND s.problem_index = pb.index
        WHERE pt.rating_change <= 250
        GROUP BY pt.user_handle, pt.new_rating
        ORDER BY pt.new_rating
        """
    )).all()

    rating_correlation_dict = defaultdict(list)

    for item in rating_correlation:
        rating_correlation_dict['rating'].append(item[0])
        rating_correlation_dict['time_registration_years'].append(item[1])

    return rating_correlation_dict


@timed_cache(seconds=3600*24)
def get_rating_distribution_by_solutions_solvability():
    rated_solvability = db.session.execute(db.text(
        """
        SELECT pt.new_rating AS rating,
                AVG(pb.success_trials::DECIMAL / NULLIF(pb.success_trials + pb.unsuccess_trials, 0)) AS avg_solutions_solvability,
                pt.user_handle
        FROM participations AS pt
        JOIN solutions AS s ON pt.user_handle = s.user_handle
        JOIN problems AS pb ON s.problem_contest_id = pb.contest_id AND s.problem_index = pb.index
        WHERE pt.rating_change <= 250
        GROUP BY pt.user_handle, pt.new_rating
        ORDER BY pt.new_rating
        """
    )).all()

    rated_solvability_dict = defaultdict(list)

    for item in rated_solvability:
        rated_solvability_dict['rating'].append(item[0])
        rated_solvability_dict['time_registration_years'].append(item[1])

    return rated_solvability_dict



@timed_cache(seconds=3600 * 24)
def get_blog_topics_data():
    topics_data = db.session.execute(db.text(
        """
        SELECT bt.tag, AVG(b.rating), AVG("numberOfComments")
        FROM blogs AS b
        JOIN blog_tags AS bt ON b.id = bt.blog_id
        GROUP BY bt.tag
        ORDER BY bt.tag
        """
    )).all()

    topics_data = [{
        "topic": item[0],
        "avg_rating": item[1],
        "avg_number_of_comments": item[2]
    } for item in topics_data]

    return topics_data
