export default function Badge({ className, color }) {
    return (
      <svg
        fill={color}
        className={`icon flat-color ${className}`}
        viewBox="0 0 24 24"
        id="lightning"
        data-name="Flat Color"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="primary"
          d="M18,11.74a1,1,0,0,0-.52-.63L14.09,9.43,15,3.14a1,1,0,0,0-1.78-.75l-7,9a1,1,0,0,0-.18.87,1.05,1.05,0,0,0,.6.67l4.27,1.71L10,20.86a1,1,0,0,0,.63,1.07A.92.92,0,0,0,11,22a1,1,0,0,0,.83-.45l6-9A1,1,0,0,0,18,11.74Z"
          style={{
            fill: color,
          }}
        />
      </svg>
    );
  }
  