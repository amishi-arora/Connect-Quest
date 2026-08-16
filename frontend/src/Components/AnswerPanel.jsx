import "./AnswerPanel.css";
import { useState } from "react";

export default function AnswerPanel({points}) {
    const [isEditing, setIsEditing] = useState(false);
    const [initalPoints, setPoints] = useState(0); 
    const [popupVisible, setPopupVisible] = useState(false);
    const [image, setImage] = useState(null);//

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result);
            setPoints(points);  // Add points for uploading a photo
            setPopupVisible(true);
            setTimeout(() => setPopupVisible(false), 3000);
          };
          reader.readAsDataURL(file);
        }
      };
    
      const handleCapture = () => {
        setIsEditing(false);
        const captureInput = document.createElement("input");
        captureInput.type = "file";
        captureInput.accept = "image/*";
        captureInput.capture = "environment"; // Trigger the camera on mobile
    
        captureInput.onchange = handleFileChange;
        captureInput.click(); // Trigger the file input dialog to open the camera
      };
    
      const handleClick = () => {
        setIsEditing(true);
      };
    
      const handleKeyDown = (event) => {
        if (event.key === "Enter") {
          setPoints(points); 
          setIsEditing(false);
          setPopupVisible(true);
    
          setTimeout(() => setPopupVisible(false), 3000);
        }
      };
    
      return (
        <div id="answerspace">
          <div id="answerButtons">
            <button className="answerButton" onClick={handleClick}>
              Enter your answer
            </button>
            <button className="answerButton" onClick={handleCapture}>
              Upload photo!
            </button>
          </div>
          {popupVisible && (
            <div className="popup">
              <p id="popupMessage">
                Congratulations! <br />
                You have completed today's Connect Quest challenge.
              </p>
            </div>
          )}
          {isEditing && <input type="text" onKeyDown={handleKeyDown} />}
          {image && (
            <div>
              <h3 id = "preview">Preview:</h3>
              <img
                src={image}
                alt="Preview"
                style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
              />
            </div>
          )}
          <div id="pointsDisplay">
            <h1 className="points">Total points</h1>
            <h1 className="points">{initalPoints}</h1>
          </div>
        </div>
      );
    }