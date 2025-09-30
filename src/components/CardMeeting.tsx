import React from 'react';
import styled from 'styled-components';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CardMeetingProps {
    title: string;
    time: string;
    day: string;
    location: string;
    description: string;
    category: string;
    capacity: number;
    registered: number;
    onJoin?: () => void;
}

const CardMeeting: React.FC<CardMeetingProps> = ({
    title,
    time,
    day,
    location,
    description,
    category,
    capacity,
    registered,
    onJoin
}) => {
    const attendancePercentage = (registered / capacity) * 100;

    return (
        <StyledWrapper>
            <div className="parent">
                <div className="card">
                    <div className="logo">
                        {/* <span className="circle circle1" /> */}
                        {/* <span className="circle circle2" /> */}
                        <span className="circle circle3" />
                        <span className="circle circle4" />
                        <span className="circle circle5">
                            <Calendar className="svg" />
                        </span>
                    </div>
                    <div className="glass" />
                    <div className="content">
                        <span className="title">{title}</span>
                        <div className="meeting-info">
                            <div className="info-item">
                                <Clock className="icon" />
                                <span>{day} - {time}</span>
                            </div>
                            <div className="info-item">
                                <MapPin className="icon" />
                                <span>{location}</span>
                            </div>
                            <div className="info-item">
                                <Users className="icon" />
                                <span>{registered}/{capacity}</span>
                            </div>
                        </div>
                        <span className="text">{description}</span>
                        <div className="capacity-bar">
                            <div className="capacity-fill" style={{ width: `${attendancePercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="category-badge">
                            <span className="category-text">{category}</span>
                        </div>
                        <div className="view-more">
                            <button className="view-more-button" onClick={onJoin}>
                                معرفة المزيد
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    .parent {
        width: 360px;
        height: 380px;
        perspective: 1000px;
    }

    .card {
        height: 100%;
        border-radius: 50px;
        background: linear-gradient(135deg, rgb(0, 255, 214) 0%, rgb(8, 226, 96) 100%);
        transition: all 0.5s ease-in-out;
        transform-style: preserve-3d;
        box-shadow: rgba(5, 71, 17, 0) 40px 50px 25px -40px, rgba(5, 71, 17, 0.2) 0px 25px 25px -5px;
    }

    .glass {
        transform-style: preserve-3d;
        position: absolute;
        inset: 8px;
        border-radius: 55px;
        border-top-right-radius: 100%;
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.349) 0%, rgba(255, 255, 255, 0.815) 100%);
        transform: translate3d(0px, 0px, 25px);
        border-left: 1px solid white;
        border-bottom: 1px solid white;
        transition: all 0.5s ease-in-out;
    }

  .content {
    padding: 80px 40px 0px 30px;
    transform: translate3d(0, 0, 26px);
  }

  .content .title {
    display: block;
    color: #000;
    font-weight: 900;
    font-size: 18px;
    margin-bottom: 15px;
  }

  .meeting-info {
    margin-bottom: 15px;
  }

  .info-item {
    display: flex;
    align-items: center;
    color: #000;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .info-item .icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
    stroke: rgba(0, 137, 78, 0.8);
    fill: none;
    stroke-width: 2px;
  }

  .content .text {
    display: block;
    color: #000;
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 15px;
  }

  .capacity-bar {
    width: 100%;
    height: 6px;
    background: rgba(0, 137, 78, 0.2);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .capacity-fill {
    height: 100%;
    background: linear-gradient(90deg, #00c37b, #00894d);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .bottom {
    padding: 10px 12px;
    transform-style: preserve-3d;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translate3d(0, 0, 26px);
  }

  .category-badge {
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 12px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .category-text {
    color: #000;
    font-size: 11px;
    font-weight: 600;
  }

  .bottom .view-more {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    transition: all 0.2s ease-in-out;
  }

  .bottom .view-more:hover {
    transform: translate3d(0, 0, 10px);
  }

  .bottom .view-more .view-more-button {
    background: none;
    border: none;
    color: #000;
    font-weight: bolder;
    font-size: 12px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 20px;
    transition: background 0.2s ease;
  }

  .bottom .view-more .view-more-button:hover {
    background: rgba(0, 195, 123, 0.1);
  }

  .bottom .view-more .svg {
    fill: none;
    stroke: #00c37b;
    stroke-width: 3px;
    max-height: 15px;
  }

  .logo {
    position: absolute;
    left: 0;
    top: 0;
    transform-style: preserve-3d;
  }

  .logo .circle {
    display: block;
    position: absolute;
    aspect-ratio: 1;
    border-radius: 50%;
    top: 0;
    left: 0;
    box-shadow: rgba(100, 100, 111, 0.2) 10px 10px 20px 0px;
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    background: rgba(0, 249, 203, 0.2);
    transition: all 0.5s ease-in-out;
  }

  .logo .circle1 {
    width: 170px;
    transform: translate3d(0, 0, 20px);
    top: 8px;
    left: 8px;
  }

  .logo .circle2 {
    width: 140px;
    transform: translate3d(0, 0, 40px);
    top: 10px;
    left: 10px;
    -webkit-backdrop-filter: blur(1px);
    backdrop-filter: blur(1px);
    transition-delay: 0.4s;
  }

  .logo .circle3 {
    width: 110px;
    transform: translate3d(0, 0, 60px);
    top: 17px;
    left: 17px;
    transition-delay: 0.8s;
  }

  .logo .circle4 {
    width: 80px;
    transform: translate3d(0, 0, 80px);
    top: 23px;
    left: 23px;
    transition-delay: 1.2s;
  }

  .logo .circle5 {
    width: 50px;
    transform: translate3d(0, 0, 100px);
    top: 30px;
    left: 30px;
    display: grid;
    place-content: center;
    transition-delay: 1.6s;
  }

  .logo .circle5 .svg {
    width: 20px;
    stroke: white;
    fill: none;
    stroke-width: 2px;
  }

  .parent:hover .card {
    transform: rotate3d(1, 1, 0, 30deg);
    box-shadow: rgba(5, 71, 17, 0.3) 30px 50px 25px -40px, rgba(5, 71, 17, 0.1) 0px 25px 30px 0px;
  }

  .parent:hover .card .logo .circle2 {
    transform: translate3d(0, 0, 60px);
  }

  .parent:hover .card .logo .circle3 {
    transform: translate3d(0, 0, 80px);
  }

  .parent:hover .card .logo .circle4 {
    transform: translate3d(0, 0, 100px);
  }

  .parent:hover .card .logo .circle5 {
    transform: translate3d(0, 0, 120px);
  }
`;

export default CardMeeting;
