<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]



<br />
<div align="center">
  <h3 align="center">Codeforces Insights</h3>
  <p align="center" style="color:rgb(171, 128, 0);">
    Website visualizing statistics of competitive programmers activity on the Codeforces.
    <br />
  </p>
</div>


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#roadmap">Roadmap</a>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#launch-the-project">Launch the project</a></li>
    <ul>
        <li><a href="#backend">Backend</a></li>
        <li><a href="#frontend">Frontend</a></li>
      </ul>
    </li>
  </ol>
</details>

## About The Project
We aim to create a website that will reflect the dependence of the development of competitive programming skills on various learning factors. Our project will be based on data from the Codeforces website. This website contains tasks and regularly holds contests, through which participants change their rating. 

 The goal of the project </span> is to guide developing competitive programmers in the right direction by demonstrating what topics were studied and what tasks were solved by individuals who reached their desired rating.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

 <span style="color:rgb(171, 128, 0);"> Week 1: </span> Design generation
 <span style="color:rgb(171, 128, 0);">Week 2: </span> Scraping data, data preprocessing, filling the database
 <span style="color:rgb(171, 128, 0);">Week 3: </span> Visualization planning, Flask API development
 <span style="color:rgb(171, 128, 0);">Week 4: </span> LLM creation or choice
 <span style="color:rgb(171, 128, 0);">Week 5: </span> Frontend implementation
 <span style="color:rgb(171, 128, 0);">Week 6: </span> Implementation of core visualizations in D3.js and basic chart integrations
 <span style="color:rgb(171, 128, 0);">Week 7: </span> Implementation of interactive features, panel integration, advanced feature development
 <span style="color:rgb(171, 128, 0);">Week 8: </span> Final testing, polishing, presentation preparation

## Built With

The Daily Meeting Telegram was built using:

* [![Python][Python.js]][Python-url]
  * [![Flask][Flask.js]][Flask-url]
  * [![SQLAlchemy][SQLAlchemy.js]][SQLAlchemy-url]
* [![PostgreSQL][PostgreSQL.js]][PostgreSQL-url]
* [![React][React.js]][React-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Launch the project

### Backend

Go to the `backend` folder and create a virtual environment:

```bash
cd backend
python -m venv venv        # Create a virtual environment
source venv/bin/activate   # For Linux/macOS
venv\Scripts\activate      # For Windows
pip install -r requirements.txt  # Install dependencies
```

Run the Flask server

```bash
python app.py
```
After the server starts, it will be available at http://127.0.0.1:5000.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Frontend
Go to the frontend folder and install dependencies:

```bash
cd ../frontend
npm install
```

To run both parts of the project (frontend + backend) simultaneously, use the following command:

```bash
npm start
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



[contributors-shield]: https://img.shields.io/github/contributors/team-work-tools/team-work-telegram-bot?style=for-the-badge&color=%23F5C638
[contributors-url]: ../../contributors

[forks-shield]: https://img.shields.io/github/forks/team-work-tools/team-work-telegram-bot?style=for-the-badge&color=%23F5C638
[forks-url]: ../../forks

[issues-shield]: https://img.shields.io/github/issues/team-work-tools/team-work-telegram-bot?style=for-the-badge&color=%23F5C638
[issues-url]: ../../issues

[license-shield]: https://img.shields.io/github/license/team-work-tools/team-work-telegram-bot?style=for-the-badge&color=%23F5C638
[license-url]: ./LICENSE

[Bot]: https://img.shields.io/badge/BOT-544987?style=for-the-badge
[Bot-url]: https://t.me/daily_meeting_t34_bot

[Python.js]: https://img.shields.io/badge/Python-F5C638?style=for-the-badge&logo=python&logoColor=grey
[Python-url]: https://www.python.org/

[Flask.js]: https://img.shields.io/badge/Flask-AB8000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/en/stable/

[SQLAlchemy.js]: https://img.shields.io/badge/SQLalchemy-AB8000?style=for-the-badge&logo=SQLalchemy&logoColor=white
[SQLAlchemy-url]: https://www.sqlalchemy.org/

[PostgreSQL.js]: https://img.shields.io/badge/PostgreSQL-F5C638?style=for-the-badge&logo=PostgreSQL&logoColor=grey
[PostgreSQL-url]: https://www.postgresql.org/

[React.js]: https://img.shields.io/badge/React-F5C638?style=for-the-badge&logo=React&logoColor=grey
[React-url]: https://react.dev/
