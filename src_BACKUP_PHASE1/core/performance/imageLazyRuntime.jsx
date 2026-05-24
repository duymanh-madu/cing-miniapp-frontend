import {
  useInView,
} from "react-intersection-observer";

function ImageLazyRuntime({
  src,
  alt,
  className,
}) {

  const {
    ref,
    inView,
  } = useInView({

    triggerOnce:
      true,

    rootMargin:
      "100px",

  });

  return (

    <img
      ref={ref}
      src={
        inView
          ? src
          : ""
      }
      alt={alt}
      className={className}
      loading="lazy"
    />

  );

}

export default
  ImageLazyRuntime;