import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthSubmit({ getDefaultErrorMessage, getCatchErrorMessage }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (action) => {
    setIsSubmitting(true);
    try {
      const res = await action();
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || getDefaultErrorMessage());
      }
    } catch (err) {
      setError(getCatchErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { error, setError, isSubmitting, submit };
}