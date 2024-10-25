import React from "react";
import { Card, Image, Stack } from "react-bootstrap";
import comingSoonImage from "../../assets/images/coming-soon.svg";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";

export default function Dashboard() {
  let loading = false;

  const handleAdd = () => {
    alert(1);
  };

  const handleEdit = () => {
    alert(1);
  };
  return (
    <>
      {loading ? (
        <Loader isLoading={loading} />
      ) : (
        <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
          {/* Header */}
          <PageHeader
            title="Dashboard"
            // actions={[
            //   { label: "ADD NEW", onClick: handleAdd, variant: "warning" },
            //   { label: "Help", to: "/help", variant: "outline-dark" },
            //   { label: "Learn More", onClick: handleAdd, variant: "primary" },
            //   { label: "EDIT", onClick: handleEdit, variant: "outline-primary" },
            // ]}
          />
          <Card className="border-0 flex-grow-1 d-flex flex-column">
            <div className="m-auto text-center">
              <div>
                <Image
                  className="img-fluid"
                  src={comingSoonImage}
                  alt="Coming Soon Banner"
                  width={421}
                  height={236}
                />
              </div>
              <h2 className="display-6 fw-bold mt-4 mb-0 opacity-75">
                Coming Soon
              </h2>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
