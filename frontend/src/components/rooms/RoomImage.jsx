import SafeImage from '../SafeImage';

/** Room gallery image — thin wrapper around SafeImage for consistent room UI. */
export default function RoomImage(props) {
  return <SafeImage {...props} />;
}
