interface ColorClassesProps {
  [key: string]: string;
}
const AlertCard = ({
  bgColor,
  title,
  subtitle,
}: {
  bgColor: string;
  title: string;
  subtitle: string;
}) => {
  const colorClasses: ColorClassesProps = {
    red: "bg-red-700",
    green: "bg-green-700",
    yellow: "bg-yellow-500",
  };
  return (
    <div
      className={`${colorClasses[bgColor]} text-white p-3 rounded-md shadow-md max-w-60`}
    >
      <h1 className="text-[14px] font-bold">{title}</h1>
      <p className="text-[12px]">{subtitle}</p>
    </div>
  );
};

export default AlertCard;
