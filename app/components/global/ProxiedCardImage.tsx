import Image from "next/image";
import { getImageProxyUrl } from "@/app/helper/imageProxy";

interface ProxiedCardImageProps {
  externalUrl: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const ProxiedCardImage = ({
  externalUrl,
  alt,
  width = 300,
  height = 420,
  className = "",
}: ProxiedCardImageProps) => {
  const proxiedUrl = getImageProxyUrl(externalUrl);

  return (
    <Image
      src={proxiedUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={false}
      onError={(e) => {
        console.error(`Failed to load proxied image: ${externalUrl}`, e);
      }}
    />
  );
};
