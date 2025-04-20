from functools import lru_cache
from config import db
import numpy as np
import time

supertopics = {
  "programming competitions": "Competitions and Platforms",
  "online judges": "Competitions and Platforms",
  "programming languages": "Programming and Paradigms",
  "data structures": "Algorithms and Data Structures",
  "graph algorithms": "Algorithms and Data Structures",
  "graph theory": "Mathematics and Theory",
  "dynamic programming": "Algorithms and Data Structures",
  "string algorithms": "Algorithms and Data Structures",
  "mathematics": "Mathematics and Theory",
  "debugging": "Tools and Optimization",
  "development tools": "Tools and Optimization",
  "community": "Community and Interaction",
  "career development": "Education and Career",
  "problem types": "Mathematics and Theory",
  "contest management": "Competitions and Platforms",
  "system issues": "Platforms and Security",
  "user management": "Community and Interaction",
  "video content": "Education and Career",
  "artificial intelligence": "Miscellaneous Topics",
  "educational resources": "Education and Career",
  "performance optimization": "Tools and Optimization",
  "problem solving": "Education and Career",
  "algorithm types": "Algorithms and Data Structures",
  "contest participation": "Competitions and Platforms",
  "content management": "Community and Interaction",
  "training and coaching": "Education and Career",
  "personal development": "Education and Career",
  "number theory": "Mathematics and Theory",
  "bit manipulation": "Algorithms and Data Structures",
  "functional programming": "Programming and Paradigms",
  "company-related": "Miscellaneous Topics",
  "miscellaneous": "Miscellaneous Topics",
  "user interface": "Community and Interaction",
  "testing and submission": "Tools and Optimization",
  "feedback and complaints": "Community and Interaction",
  "concurrency": "Programming and Paradigms",
  "code optimization": "Tools and Optimization",
  "input output": "Programming and Paradigms",
  "variables and types": "Programming and Paradigms",
  "system design": "Tools and Optimization",
  "security": "Platforms and Security",
  "contest results": "Competitions and Platforms",
  "geometry": "Mathematics and Theory",
  "ton": "Miscellaneous Topics",
  "queue management": "Algorithms and Data Structures",
  "recursion": "Algorithms and Data Structures",
  "sorting": "Algorithms and Data Structures",
  "productivity": "Tools and Optimization",
  "emotions": "Miscellaneous Topics",
  "problem creation": "Education and Career",
  "interview preparation": "Education and Career",
  "platform issues": "Platforms and Security",
  "programming concepts": "Programming and Paradigms",
  "learning resources": "Education and Career",
  "platform features": "Community and Interaction",
  "competitive programming platforms": "Competitions and Platforms",
  "regional contests": "Competitions and Platforms",
  "competitive programming journey": "Education and Career",
  "api issues": "Platforms and Security",
  "rating system": "Platforms and Security",
  "optimization": "Tools and Optimization",
  "probability": "Mathematics and Theory",
  "data analysis": "Miscellaneous Topics",
  "search techniques": "Algorithms and Data Structures",
  "special rounds": "Competitions and Platforms",
  "coding platforms": "Competitions and Platforms",
  "community events": "Community and Interaction",
  "hardware": "Tools and Optimization"
}


def timed_cache(seconds):
    """
    Custom decorator that combines LRU caching with time-based cache invalidation.
    Creates a caching layer that automatically clears after specified duration,
    while maintaining the benefits of least-recently-used caching strategy.

    Args:
        seconds (int): Cache validity duration in seconds

    Returns:
        function: Decorator that manages cached function results with time-based expiration
    """

    def decorator(func):
        @lru_cache(maxsize=None)
        def cached_func(*args, **kwargs):
            """Inner cached function using LRU cache strategy"""
            return func(*args, **kwargs)

        def wrapper(*args, **kwargs):
            """
            Wrapper function that manages cache expiration.
            Checks time elapsed since last reset and clears cache when expired.
            """
            result = cached_func(*args, **kwargs)
            if time.time() - wrapper.last_reset > seconds:
                cached_func.cache_clear()
                wrapper.last_reset = time.time()
            return result

        wrapper.last_reset = time.time()
        return wrapper

    return decorator


@timed_cache(seconds=3600 * 24)
def get_topics():
    """
    Fetch and cache unique problem tags from database.
    Results are cached for 24 hours to reduce database load.

    Returns:
        list[str]: Alphabetically sorted unique problem tags
    """
    # Raw SQL execution for maximum performance
    topics = db.session.execute(db.text(
        """SELECT DISTINCT tag FROM problem_tags;"""
    )).all()
    # Convert SQLAlchemy Row objects to simple strings
    return [topic[0] for topic in topics]


@timed_cache(seconds=3600 * 24)
def get_topics_distribution_by_rating():
    """
    Calculate distribution of problems across different difficulty ratings for each tag.
    Provides insights into which tags appear at different difficulty levels.

    Returns:
        list[dict]: Dictionary entries with:
            - topic (str): Problem tag name
            - rating (int): Problem difficulty rating
            - number_of_tasks (int): Count of problems in this category
    """
    # Complex join between problem tags and problem metadata
    topic_rating_distribution = db.session.execute(db.text(
        """
        SELECT pt.tag, p.rating, count(*)
        FROM problem_tags AS pt
        JOIN problems AS p ON pt.problem_contest_id = p.contest_id 
                             AND pt.problem_index = p.index
        GROUP BY pt.tag, p.rating
        ORDER BY pt.tag, p.rating
        """
    )).all()

    # Transform raw SQL results into structured dictionaries
    return [{
        "topic": item[0],
        "rating": item[1],
        "number_of_tasks": item[2]
    } for item in topic_rating_distribution]


@timed_cache(seconds=3600 * 24)
def get_topics_correlation():
    """
    Calculate co-occurrence frequency of tag pairs within problems.
    Identifies which tags commonly appear together in the same problems.

    Returns:
        list[dict]: Dictionary entries with:
            - topic1 (str): First tag in pair
            - topic2 (str): Second tag in pair
            - number_of_tasks (int): Count of shared problems
    """
    # Self-join on problem_tags to find tag correlations
    topics_correlation = db.session.execute(db.text(
        """
        SELECT pt1.tag, pt2.tag, count(*)
        FROM problem_tags AS pt1
        JOIN problem_tags AS pt2
            ON pt1.problem_contest_id = pt2.problem_contest_id 
            AND pt1.problem_index = pt2.problem_index
        GROUP BY pt1.tag, pt2.tag
        ORDER BY pt1.tag, pt2.tag
        """
    )).all()

    return [{
        "topic1": item[0],
        "topic2": item[1],
        "number_of_tasks": item[2]
    } for item in topics_correlation]


@timed_cache(seconds=3600 * 24)
def get_topics_solvability():
    """
    Calculate success rates for problems grouped by tags.
    Measures relative difficulty of different topics based on user submissions.

    Returns:
        list[dict]: Dictionary entries with:
            - topic (str): Problem tag name
            - solvability (float): Ratio of successful submissions to total attempts
    """
    # Calculate success ratios using database-level division
    topic_trials = db.session.execute(db.text(
        """
        SELECT pt.tag, 
               SUM(p.success_trials), 
               (SUM(p.success_trials) + SUM(p.unsuccess_trials))
        FROM problem_tags AS pt
        JOIN problems AS p ON pt.problem_contest_id = p.contest_id 
                            AND pt.problem_index = p.index
        GROUP BY pt.tag
        """
    )).all()

    # Convert to solvability percentage while handling division by zero
    return [{
        "topic": item[0],
        "solvability": item[1] / item[2] if item[2] > 0 else 0.0
    } for item in topic_trials]


@timed_cache(seconds=3600 * 24)
def get_rating_distribution_by_experience():
    """
    Analyze relationship between user ratings and their platform experience.
    Combines registration time with contest participation data.

    Returns:
        dict: Contains:
            - rating_experience_correlation (float): Pearson correlation coefficient
            - data (list[dict]): Individual entries with:
                - rating (float): User rating
                - time_registration_years (float): Years since registration
    """
    # CTE for getting users' last contest participation
    rated_experience = db.session.execute(db.text(
        """
        WITH user_last_contest AS (
            SELECT p.user_handle, 
                   MAX(contests.id) AS contest_id,
                   MAX("startTimeSeconds") AS startTimeSeconds
            FROM participations AS p
            JOIN contests ON p.contest_id = contests.id
            GROUP BY p.user_handle
        )
        SELECT p.new_rating AS rating,
                ((ulc.startTimeSeconds - "registrationTimeSeconds") 
                 / (3600 * 24 * 365)) AS experience
        FROM users AS u
        JOIN user_last_contest AS ulc ON u.handle = ulc.user_handle
        JOIN participations AS p ON u.handle = p.user_handle 
                                  AND p.contest_id = ulc.contest_id
        WHERE p.rating_change <= 250
        ORDER BY p.new_rating
        """
    )).all()

    # Convert to NumPy array for efficient calculations
    rated_experience = np.array(rated_experience, dtype='float32')
    rating = rated_experience[:, 0]
    experience = rated_experience[:, 1]

    return {
        "rating_experience_correlation": np.corrcoef(rating, experience)[0, 1],
        "data": [{
            "rating": float(item[0]),
            "time_registration_years": float(item[1])
        } for item in rated_experience]
    }


@timed_cache(seconds=3600 * 24)
def get_rating_distribution_by_solutions_amount():
    """
    Analyze relationship between user ratings and their total solutions submitted.
    Helps identify if higher-rated users solve more problems.

    Returns:
        dict: Contains:
            - rating_solutions_count_correlation (float): Pearson correlation
            - data (list[dict]): Individual entries with:
                - rating (float): User rating
                - number_of_solved_problems (float): Total solutions
    """
    # Join participations with solutions count
    rated_solutions_number = db.session.execute(db.text(
        """
        SELECT p.new_rating AS rating, 
               count(*) AS number_of_solutions
        FROM participations AS p
        JOIN solutions AS s ON p.user_handle = s.user_handle
        WHERE p.rating_change <= 250
        GROUP BY p.user_handle, p.new_rating
        ORDER BY p.new_rating
        """
    )).all()

    rated_solutions_number = np.array(rated_solutions_number, dtype='float32')
    return {
        "rating_solutions_count_correlation": np.corrcoef(
            rated_solutions_number[:, 0],
            rated_solutions_number[:, 1]
        )[0, 1],
        "data": [{
            "rating": float(item[0]),
            "number_of_solved_problems": float(item[1])
        } for item in rated_solutions_number]
    }


@timed_cache(seconds=3600 * 24)
def get_rating_distribution_by_solutions_rating():
    """
    Analyze relationship between user ratings and average rating of solved problems.
    Shows if users solve problems matching their skill level.

    Returns:
        dict: Contains:
            - rating_correlation (float): Pearson correlation coefficient
            - data (list[dict]): Individual entries with:
                - rating (float): User rating
                - avg_rating_of_solved_problems (float): Average problem rating
    """
    # Multi-table join across participations, solutions, and problems
    rating_correlation = db.session.execute(db.text(
        """
        SELECT pt.new_rating AS rating,
                AVG(pb.rating) AS avg_solutions_rating
        FROM participations AS pt
        JOIN solutions AS s ON pt.user_handle = s.user_handle
        JOIN problems AS pb ON s.problem_contest_id = pb.contest_id 
                             AND s.problem_index = pb.index
        WHERE pt.rating_change <= 250
        GROUP BY pt.user_handle, pt.new_rating
        ORDER BY pt.new_rating
        """
    )).all()

    rating_correlation = np.array(rating_correlation, dtype='float32')
    return {
        "rating_correlation": np.corrcoef(
            rating_correlation[:, 0],
            rating_correlation[:, 1]
        )[0, 1],
        "data": [{
            "rating": float(item[0]),
            "avg_rating_of_solved_problems": float(item[1])
        } for item in rating_correlation]
    }


@timed_cache(seconds=3600 * 24)
def get_rating_distribution_by_solutions_solvability():
    """
    Analyze relationship between user ratings and solvability of attempted problems.
    Measures if higher-rated users attempt harder problems.

    Returns:
        dict: Contains:
            - rating_solvability_correlation (float): Pearson correlation
            - data (list[dict]): Individual entries with:
                - rating (float): User rating
                - avg_solvability_of_solved_problems (float): Success rate
    """
    # Calculate solvability using database-level division
    rated_solvability = db.session.execute(db.text(
        """
        SELECT pt.new_rating AS rating,
                AVG(pb.success_trials::DECIMAL / 
                   NULLIF(pb.success_trials + pb.unsuccess_trials, 0)) 
                   AS avg_solutions_solvability
        FROM participations AS pt
        JOIN solutions AS s ON pt.user_handle = s.user_handle
        JOIN problems AS pb ON s.problem_contest_id = pb.contest_id 
                             AND s.problem_index = pb.index
        WHERE pt.rating_change <= 250
        GROUP BY pt.user_handle, pt.new_rating
        ORDER BY pt.new_rating
        """
    )).all()

    rated_solvability = np.array(rated_solvability, dtype='float32')
    return {
        "rating_solvability_correlation": np.corrcoef(
            rated_solvability[:, 1],
            rated_solvability[:, 0]
        )[0, 1],
        "data": [{
            "rating": float(item[0]),
            "avg_solvability_of_solved_problems": float(item[1])
        } for item in rated_solvability]
    }


@timed_cache(seconds=3600 * 24)
def get_blog_topics_data():
    """
    Aggregate blog statistics grouped by tags and supertopics.
    Provides insights into blog engagement metrics across different topics.

    Returns:
        list[dict]: Dictionary entries with:
            - topic (str): Blog tag name
            - avg_rating (float): Average blog rating
            - avg_number_of_comments (float): Average comments per blog
            - number_of_blogs (int): Total blogs with this tag
            - supertopic (str): Mapped broad category from supertopics
    """
    # Aggregate blog statistics with SQL functions
    topics_data = db.session.execute(db.text(
        """
        SELECT bt.tag, 
               AVG(b.rating), 
               AVG("numberOfComments"), 
               COUNT(*)
        FROM blogs AS b
        JOIN blog_tags AS bt ON b.id = bt.blog_id
        GROUP BY bt.tag
        ORDER BY bt.tag
        """
    )).all()

    # Enhance data with supertopic classification
    return [{
        "topic": item[0],
        "avg_rating": float(item[1]) if item[1] else 0.0,
        "avg_number_of_comments": float(item[2]) if item[2] else 0.0,
        "number_of_blogs": item[3],
        "supertopic": supertopics.get(item[0], "Uncategorized")
    } for item in topics_data]
