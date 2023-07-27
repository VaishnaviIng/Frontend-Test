import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import './StockTradeForm.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TypingText = ({ text, speed }) => {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setTypedText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        clearInterval(timer);
        // Reset the typedText and currentIndex after typing is complete
        setTimeout(() => {
          setTypedText('');
          setCurrentIndex(0);
        }, 1000); // Add a delay of 1000ms before starting typing again
      }
    }, speed);

    return () => clearInterval(timer);
  }, [currentIndex, text, speed]);

  return <span className="typing-text">{typedText}</span>;
};
const StockTradeForm = () => {

  const [tradeStats, setTradeStats] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [symbolError, setSymbolError] = useState('');
  const [dateError, setDateError] = useState('');
  const textToType = "Stock Trade Statistics";
  const typingSpeed = 100;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'symbol') {
      setSymbol(value.toUpperCase());
      setSymbolError('');
    } else if (name === 'date') {
      setDate(value);
      setDateError('');
    }
  };

  //A Function to validate and fetch API request.
  const fetchTradeStats = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!symbol) {
      setSymbolError('Please enter a stock symbol.');
      setLoading(false);
      return;
    }

    // Validate date field
    if (!date) {
      setDateError('Please select a date.');
      setLoading(false);
      return;
    }
    // Make the POST request to the server's API route
    fetch('http://localhost:5000/api/fetchStockData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol, date }),
    })
      .then((response) => response.json())
      .then((data) => {
        const formattedData = [
          {
            t: data.Data[0].t,
            o: data.Data[0].o, // 'o' is the open value
            c: data.Data[0].c, // 'c' is the closing value
            h: data.Data[0].h, // 'h' is the high value

            l: data.Data[0].l // 'l' is the low value

          },
        ];
 


        setTradeStats(formattedData);
  
        setLoading(false);
        setShowChart(true);
      })
      .catch((error) => {
    
        alert('Error fetching trade statistics. Please try again later.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h1 style={{ fontSize: "48px" }}><TypingText text={textToType} speed={typingSpeed} /></h1>
      <div>
        <form onSubmit={fetchTradeStats}>
          <label htmlFor="symbol">Enter Stock Symbol</label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={symbol}
            onChange={handleInputChange}
            placeholder="AAPL"
          />
          {symbolError && <h3 className="error-message">{symbolError}</h3>}

          <label htmlFor="date">Select Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={handleInputChange}
          />
          {dateError && <h3 className="error-message">{dateError}</h3>}

          <button type="submit" disabled={loading}>
            {loading ? (
              <div className="loader" />
            ) : (
              'Get Statistics'
            )}
          </button>
        </form>
    
        {!showChart && (
          <div class="scrolling-text-container">
            <div class="scrolling-text"> <p style={{ color: "aqua", fontSize: "20px" }}>Click the "Get Statistics" button to fetch trade statistics and generate the chart.</p></div>
          </div>
        )}

      </div>
    

      {tradeStats && showChart && (
        <div>
          <h2>Trade Statistics Chart</h2>
          <div style={{ display: "flex", justifyContent: "center" }}><BarChart width={600} height={300} data={tradeStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" tickFormatter={(tick) => moment(tick).format('YYYY-MM-DD')} />
            <YAxis />
            <Tooltip />
            <Legend />
           <Bar dataKey="h" fill="#0530ad" name="High" />
            <Bar dataKey="l" fill="#5D76A9" name="Low" />
            <Bar dataKey="o" fill="#0066b2" name="Open" />
            <Bar dataKey="c" fill="#0530ad" name="Close" />
          </BarChart></div>

        </div>
      )}

      {loading && !showChart && (
        <div className="loading-container">
          <div className="dot-loader"></div>
          <p style={{ color: "aqua", fontSize: "24px" }}>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default StockTradeForm;


