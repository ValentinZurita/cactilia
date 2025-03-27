
export const OrderDetailSkeleton = () => (
  <div className="order-detail-skeleton">
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-4">
        <div className="row">
          <div className="col-md-6">
            <div className="placeholder-glow">
              <span className="placeholder col-6 mb-2"></span>
              <span className="placeholder col-4 mb-3"></span>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <div className="placeholder-glow">
              <span className="placeholder col-4 mb-2 float-end"></span>
              <span className="placeholder col-3 float-end"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="placeholder-glow mb-4">
      <span className="placeholder col-2 me-2"></span>
      <span className="placeholder col-2 me-2"></span>
      <span className="placeholder col-2 me-2"></span>
      <span className="placeholder col-2"></span>
    </div>

    <div className="card border-0 shadow-sm rounded-4 mt-4">
      <div className="card-body p-4">
        <div className="placeholder-glow">
          <span className="placeholder col-12 mb-3"></span>
          <span className="placeholder col-12 mb-3"></span>
          <span className="placeholder col-12 mb-3"></span>
        </div>
      </div>
    </div>
  </div>
);
