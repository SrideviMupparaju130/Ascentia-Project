import React, { useEffect } from 'react';
import '../assets/css/About.css';
import LOGO from '../assets/images/LOGO.png';
import background from '../assets/images/background2.png';
import city from '../assets/images/city.png';
import connect from '../assets/images/connect.jpeg';
import quest from '../assets/images/quest.jpeg';
import stars from '../assets/images/stars.png';
import task from '../assets/images/task.jpeg';
import xp from '../assets/images/xp.jpeg';

const App = () => {
  useEffect(() => {
    initClouds();
  }, []);

  const initClouds = () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    const clouds = [];
    const cloudCount = Math.ceil(width * 0.2666666);
    const speed = 1.11;

    const curtainOpacity = 1;
    const fadeOutTime = 20000000000; // Curtain fade time in milliseconds

    function Cloud(properties) {
      const defaults = {
        puffRadius: 32,
        puffColor: { r: 0, g: 255, b: 255 },
        opacity: 1000,
        count: 32,
      };
      properties = { ...defaults, ...properties };
      this.count = properties.count;
      this.points = [];
      this.minX = 0;
      this.minY = 0;
      this.maxX = 0;
      this.maxY = 0;
      this.puff = new Puff({
        radius: properties.puffRadius,
        color: properties.puffColor,
        opacity: properties.opacity,
      });
      this.img = document.createElement('canvas');
      this.ctx = this.img.getContext('2d');
      for (let i = 0; i < this.count; i++) {
        let seed = Math.random();
        let x = seed * (properties.puffRadius + seed) * Math.cos(1 + i + seed) * Math.PI;
        let y = seed * (properties.puffRadius + seed) * Math.sin(1 + i + seed) * Math.PI / 2;
        this.minX = Math.min(this.minX, x - properties.puffRadius);
        this.maxX = Math.max(this.maxX, x + properties.puffRadius);
        this.minY = Math.min(this.minY, y - properties.puffRadius);
        this.maxY = Math.max(this.maxY, y + properties.puffRadius);
        this.points.push([x, y]);
      }
      this.img.height = (this.maxY - this.minY) + properties.puffRadius * 2;
      this.img.width = (this.maxX - this.minX) + properties.puffRadius * 2;
      this.render();
    }

    function Puff(properties) {
      const color = (obj) => `${obj.r},${obj.g},${obj.b}`;
      this.img = document.createElement('canvas');
      const context = this.img.getContext('2d');
      this.img.height = this.img.width = properties.radius * 2;
      const grad = context.createRadialGradient(properties.radius, properties.radius, 0, properties.radius, properties.radius, properties.radius);
      grad.addColorStop(0, `rgba(${color(properties.color)},${properties.opacity})`);
      grad.addColorStop(1, `rgba(${color(properties.color)},0)`);
      context.fillStyle = grad;
      context.beginPath();
      context.arc(properties.radius, properties.radius, properties.radius, 0, Math.PI * 2, true);
      context.fill();
      context.closePath();
    }

    Cloud.prototype.render = function () {
      const cX = this.img.width / 2 - this.puff.img.width / 2;
      const cY = this.img.height / 2 - this.puff.img.height / 2;
      for (let i = 0; i < this.count; i++) {
        this.ctx.drawImage(this.puff.img, cX + this.points[i][0], cY + this.points[i][1]);
      }
    };

    const update = () => {
      for (let i = 0; i < cloudCount; i++) {
        if (clouds[i].x + clouds[i].img.width < 0) {
          clouds[i].x = width + clouds[i].img.width;
        } else {
          clouds[i].x -= clouds[i].speed;
        }
      }
      setTimeout(update, 1000 / 30);
    };

    const render = () => {
      requestAnimationFrame(render);
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < cloudCount; i++) {
        context.drawImage(clouds[i].img, clouds[i].x - clouds[i].img.width / 2, clouds[i].y - clouds[i].img.height / 2);
      }

      context.globalAlpha = curtainOpacity;
      context.fillStyle = 'rgba(0, 0, 0, 0.6)';
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 1;
    };

    for (let i = 0; i < cloudCount; i++) {
      const count = Math.random() * 64 + 32;
      const rad = Math.random() * 32 + 32;
      const cloud = new Cloud({
        count,
        puffRadius: rad,
        opacity: Math.random() * 0.02,
      });
      cloud.x = Math.random() * (width * 2) - width;
      cloud.y = cloud.img.height - Math.random() * height / 2;
      cloud.speed = speed * 0.6 + Math.random() * (speed * 0.4);
      clouds.push(cloud);
    }
    update();
    render();
  };

  return (
    <div>
      {/* Background Container */}
      <div className="background-container">
        <img src={background} className="background-layer" alt="background" />
        <img src={stars} className="stars-layer" alt="Stars" />
        <img src={city} className="city-layer" alt="City" />
        <canvas id="canvas"></canvas>
        <div className="logo-container">
          <img src={LOGO} className="logo" alt="Logo" />
        </div>
      </div>

      {/* About Us Section */}
      <section id="about-us">
        <p>
        Greetings, Player. Welcome to Ascentia – your personal growth quest begins now. Here, you are not just a user; you are the protagonist of your own story, leveling up with every decision you make. Set your goals, complete tasks, and earn XP as you progress through challenges across fitness, finance, self-care, and more. The system is designed to support you, track your journey, and reward you for every step you take toward becoming your ultimate self. Your path to greatness starts here. Will you rise to the challenge?
        </p>
      </section>

      {/* Card Section */}
      <section id="feature-cards">
        <div className="card">
          <img src={xp} alt="XP System" />
          <h3>XP System</h3>
          <p>The XP system tracks progress through task completion...</p>
        </div>
        <div className="card">
          <img src={task} alt="Task" />
          <h3>Task</h3>
          <p>Tasks break down goals into manageable actions...</p>
        </div>
        <div className="card">
          <img src={quest} alt="Quest Feature" />
          <h3>Quest Feature</h3>
          <p>Quests are personalized challenges...</p>
        </div>
        <div className="card">
          <img src={connect} alt="Connect" />
          <h3>Connect+</h3>
          <p>The "Connect with Friends" feature allows users...</p>
        </div>
      </section>

    </div>
  );
};

export default App;