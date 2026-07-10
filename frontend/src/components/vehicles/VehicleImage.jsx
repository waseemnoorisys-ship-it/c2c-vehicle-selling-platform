import { useMemo, useState } from "react";
import { getListingImageUrl } from "../../api/mappers";
import { getVehiclePlaceholderUrl } from "../../utils/vehicleImage.utils";

export default function VehicleImage({
  vehicle,
  alt,
  className = "",
  loading = "lazy",
}) {
  const [useFallback, setUseFallback] = useState(false);
  const realUrl = getListingImageUrl(vehicle);
  const placeholderUrl = useMemo(
    () => getVehiclePlaceholderUrl(vehicle),
    [vehicle?.make, vehicle?.model, vehicle?.year, vehicle?.title]
  );
  const src = !useFallback && realUrl ? realUrl : placeholderUrl;

  return (
    <img
      src={src}
      alt={alt || vehicle?.title || "Vehicle"}
      className={className}
      loading={loading}
      onError={() => setUseFallback(true)}
    />
  );
}
