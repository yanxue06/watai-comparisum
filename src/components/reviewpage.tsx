import React, { useEffect, useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import "./reviewpage.css";

interface ReviewData {
  PRODUCT_NAME: string;
  AVERAGE_RATING: string;
  SUMMARY: string;
  PROS: string[];
  CONS: string[];
  asin: string;
}

const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);

  useEffect(() => {
    // Get the data from localStorage that was saved in homepage
    const savedReviews = localStorage.getItem("reviewData");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }
  }, []);

  // Helper function to render stars based on rating
  const renderStars = (rating: string) => {
    const numStars = parseFloat(rating);
    return "⭐".repeat(numStars);
  };

  return (
    <div className="container">
      {/* ✅ ShaderGradient Background */}
      <div className="gradient-background">
        <ShaderGradientCanvas>
          <ShaderGradient
            control="query"
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.1&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=115&cameraZoom=1&color1=%235606FF&color2=%23FE8989&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&toggleAxis=false&type=waterPlane&uAmplitude=0&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=2.4&uTime=0.2&wireframe=false&zoomOut=false"
          />
        </ShaderGradientCanvas>
      </div>

      {/* Map through reviews array and display each review */}
      {reviews.map((review, index) => (
        <div key={review.asin || index} className="rounded-box">
          <div className="content">
            <h1 className="title">{review.PRODUCT_NAME}</h1>
            <p className="rating">
              Rating: {renderStars(review.AVERAGE_RATING)}
            </p>
            <p className="summary">{review.SUMMARY}</p>
            <div className="pros-cons-container">
              <div className="pros">
                <h2>Pros</h2>
                <ul>
                  {review.PROS.map((pro, idx) => (
                    <li key={idx}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="cons">
                <h2>Cons</h2>
                <ul>
                  {review.CONS.map((con, idx) => (
                    <li key={idx}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewPage;
