export const addLeadingZero = num => {
  return num <= 9 ? "0" + num : num;
};
export const clientDateTime = () => {
  var date_time = new Date();
  var curr_hour = date_time.getHours();
  var zero_added_curr_hour = addLeadingZero(curr_hour);
  var curr_min = date_time.getMinutes();
  var curr_sec = date_time.getSeconds();
  var curr_time = zero_added_curr_hour + ":" + curr_min + ":" + curr_sec;
  return curr_time;
};

export const getElapsedTime = duration => {
  let totalSeconds = duration.asSeconds();
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);

  // If you want strings with leading zeroes:
  minutes = String(minutes).padStart(2, "0");
  hours = String(hours).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");
  return hours + ":" + minutes + ":" + seconds;
};
