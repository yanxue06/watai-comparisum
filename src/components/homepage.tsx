import React, { useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import "./homepage.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [currentInput, setCurrentInput] = useState("");
  const [asinList, setAsinList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(event.target.value);
    setError(null);
  };

  const validateAsin = (asin: string) => {
    return /^[A-Z0-9]{10}$/.test(asin);
  };

  const handleSubmit = async () => {
    let asinsToSubmit: string[] = [...asinList];

    if (currentInput.trim() && validateAsin(currentInput.trim())) {
      asinsToSubmit.push(currentInput.trim());
    }

    if (asinsToSubmit.length === 0) {
      setError("Please enter at least one valid ASIN");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending ASINs:", asinsToSubmit);

      const response = await fetch("http://localhost:8000/reviewpages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asinList: asinsToSubmit,
        }),
      });

      console.log("Response status:", response.status); // Debug log
      const data = await response.json();
      console.log("Response data:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      localStorage.setItem("reviewData", JSON.stringify(data.reviews));
      navigate("/reviewpage");
    } catch (err) {
      console.error("Error details:", err); // Debug log
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && currentInput.trim()) {
      const asin = currentInput.trim();
      if (validateAsin(asin)) {
        if (!asinList.includes(asin)) {
          setAsinList([...asinList, asin]);
          setCurrentInput("");
          setError(null);
        } else {
          setError("This ASIN has already been added");
        }
      } else {
        setError(
          "Invalid ASIN format - must be 10 characters (letters and numbers)",
        );
      }
    }
  };

  return (
    <div className="p1">
      <div className="absolute inset-0 z-0">
        <ShaderGradientCanvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        >
          <ShaderGradient
            control="query"
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.1&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=115&cameraZoom=1&color1=%235606FF&color2=%23FE8989&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&toggleAxis=false&type=waterPlane&uAmplitude=0&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=2.4&uTime=0.2&wireframe=false&zoomOut=false"
          />
        </ShaderGradientCanvas>
      </div>

      <div className="content">
        <div className="text-container">
          <h1 className="mb-2 font-serif text-white text-7xl">ComparaSum</h1>
          <p className="slogan">Smart summaries, smarter decisions.</p>

          <Card className="input-card">
            <div className="input-container">
              <Input
                type="text"
                placeholder="Enter Amazon ID and press Enter"
                value={currentInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="input-field"
              />
              <Button
                onClick={handleSubmit}
                size="icon"
                disabled={
                  isLoading ||
                  (asinList.length === 0 && !validateAsin(currentInput))
                }
                className="buttondesign"
              >
                {isLoading ? "..." : "➜"}
              </Button>
            </div>

            <div className="asin-list-wrapper">
              <div className="asin-list">
                {asinList.map((asin, index) => (
                  <div key={index} className="asin-item">
                    <span>{asin}</span>
                    <button
                      onClick={() =>
                        setAsinList(asinList.filter((_, i) => i !== index))
                      }
                      className="remove-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Error message for user and development*/}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
