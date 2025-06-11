import BookingForm from "../../components/booking/BookingForm";
import { useParams } from "react-router-dom";

const BookingPage = () => {
  const { id } = useParams(); // Extract gig ID from the URL

  return (
    <div>
      <BookingForm serviceId={id} />
    </div>
  );
};

export default BookingPage;
