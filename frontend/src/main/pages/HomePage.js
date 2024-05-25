import React from "react";
import { useCurrentUser } from "main/utils/currentUser"; 
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";


export default function HomePage() {

    const { data: currentUser } = useCurrentUser();

    const getPartOfDayGreeting = () => {
        const hour = new Date().getHours();
        if (hour <= 12) return "Good morning";
        if (hour <= 18) return "Good afternoon";
        return "Good evening";
    };

    const greeting = getPartOfDayGreeting();

    const renderGreeting = (username) => (
        <h1 
            data-testid="homePage-title" 
            style={{ 
                fontSize: "75px", 
                borderRadius: "7px", 
                backgroundColor: "white", 
                opacity: ".9" 
            }} 
            className="text-center border-0 my-3"
        >
            {greeting}, {username}
        </h1>
    );

    const renderInfoSection = () => (
        <div data-testid="info-section" style={{ padding: "20px", borderRadius: "7px", marginTop: "20px" }}>
            <h2>About Organic</h2>
            <p>
            Organic is a platform designed to equip students and instructors with a comprehensive suite of tools for efficiently managing GitHub organizations associated with computer science courses.
            </p>
            <p>
            Users can input detailed course information, including the course name, term, start/end dates, and GitHub organization. Additionally, users can specify their institution's name and abbreviation, as well as the academic quarter or semester they are in. 
            </p>
            <img 
                src="https://www.startyourlab.com/img/setup/github-organization.svg" 
                alt="CS156 Project" 
                style={{ width: "100%", borderRadius: "7px", marginTop: "20px" }}
            />
        </div>
    );
   

    return (
        <div data-testid={"HomePage-main-div"}>
            <BasicLayout>
                {renderGreeting(currentUser.loggedIn ? currentUser.root.user.githubLogin : "Please Sign In First to Proceed")}
                {renderInfoSection()}
            </BasicLayout>
        </div>
    );
}