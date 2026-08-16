import { useNavigate, useLocation } from "react-router-dom";

export default function ButtonHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleChallengeClick = () => {
      navigate("/daily");
    };

    const handleListClick = () => {
        navigate("/challenges");
    };

    const handleHomeClick = () => {
        navigate("/");
    };

    return(
        <div id = "headerButtons">
          <button
            className="headerbutton"
            onClick={handleHomeClick}
          >
            Log out
          </button>
          {location.pathname === "/daily" ? (
            // Show only "Challenge List" button on /daily
            <button
              className="headerbutton"
              onClick={handleListClick}
            >
              Challenge List
            </button>
          ) : (
              <>

                {/* Static second button */}
                  <button
                    className="headerbutton"
                    onClick={handleChallengeClick}
                  >
                    Today's Challenge
                  </button>
                </>
            )}
        </div>
    )
}

